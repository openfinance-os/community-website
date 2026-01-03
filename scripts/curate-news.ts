#!/usr/bin/env tsx
/**
 * News Curation Script
 *
 * This script:
 * 1. Fetches open finance news from NewsAPI.org
 * 2. Ranks articles by relevance
 * 3. Summarizes top articles (using Claude AI if available, otherwise uses article descriptions)
 * 4. Creates draft PRs for each article
 * 5. Sends Slack notification with PR links
 *
 * Environment variables required:
 * - NEWSAPI_KEY: NewsAPI.org API key
 * - SLACK_WEBHOOK_URL: Slack incoming webhook URL
 * - GH_TOKEN: GitHub personal access token with repo scope
 * - GITHUB_REPOSITORY: owner/repo format (set automatically in GitHub Actions)
 *
 * Optional:
 * - ANTHROPIC_API_KEY: Anthropic API key for AI summarization (if not set, uses article descriptions)
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchNewsArticles, rankArticles, scoreArticle } from './utils/news-api-client.js';
import { processArticles } from './utils/article-summarizer.js';
import { createAllPRs, closeOldPRs } from './utils/github-pr-creator.js';
import { sendSlackNotification, sendErrorNotification } from './utils/slack-notifier.js';
import type { NewsSourceConfig, CuratedArticle } from './types/news-curation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load configuration
function loadConfig(): NewsSourceConfig {
  const configPath = join(__dirname, '..', 'data', 'news-curation', 'sources.json');

  if (existsSync(configPath)) {
    return JSON.parse(readFileSync(configPath, 'utf-8'));
  }

  // Default configuration
  return {
    keywords: [
      'open finance UAE',
      'open banking Middle East',
      'CBUAE fintech',
      'UAE digital banking regulation',
      'GCC fintech',
      'open banking API',
      'PSD2 Middle East',
      'UAE payment services',
    ],
    excludeDomains: ['youtube.com', 'facebook.com', 'twitter.com', 'linkedin.com'],
    preferredSources: [
      'Gulf Business',
      'Arabian Business',
      'Finextra',
      'The National',
      'Khaleej Times',
      'Gulf News',
      'PYMNTS',
      'Fintech Futures',
    ],
    maxArticlesPerRun: 5,
    lookbackHours: 48,
  };
}

// Get existing article slugs to avoid duplicates
function getExistingArticleSlugs(): Set<string> {
  const newsDir = join(__dirname, '..', 'src', 'content', 'news');
  const slugs = new Set<string>();

  if (existsSync(newsDir)) {
    const files = readdirSync(newsDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        slugs.add(file.replace('.md', ''));
      }
    }
  }

  return slugs;
}

// Check required environment variables
function checkEnvironment(): { valid: boolean; missing: string[] } {
  const required = ['NEWSAPI_KEY', 'SLACK_WEBHOOK_URL', 'GH_TOKEN'];
  const missing = required.filter((key) => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

// Parse repository from environment
function getRepoInfo(): { owner: string; repo: string } {
  const repoEnv = process.env.GITHUB_REPOSITORY || 'openfinance-os/community-website';
  const [owner, repo] = repoEnv.split('/');
  return { owner, repo };
}

async function main() {
  console.log('OpenFinance-OS News Curation');
  console.log('============================\n');

  const isDryRun = process.argv.includes('--dry-run');
  const cleanupOnly = process.argv.includes('--cleanup');

  if (isDryRun) {
    console.log('DRY RUN MODE - No PRs will be created\n');
  }

  // Check environment
  const envCheck = checkEnvironment();
  if (!envCheck.valid && !isDryRun) {
    console.error('Missing required environment variables:', envCheck.missing.join(', '));
    process.exit(1);
  }

  const config = loadConfig();
  const { owner, repo } = getRepoInfo();

  const githubOptions = {
    token: process.env.GH_TOKEN || '',
    owner,
    repo,
  };

  // Handle cleanup mode
  if (cleanupOnly) {
    console.log('Running cleanup only...\n');
    const closed = await closeOldPRs(githubOptions, 48);
    console.log(`\nCleanup complete. Closed ${closed} stale PRs.`);
    return;
  }

  try {
    // Step 1: Fetch news articles
    console.log('Step 1: Fetching news articles...\n');
    const articles = await fetchNewsArticles({
      apiKey: process.env.NEWSAPI_KEY || '',
      config,
    });

    if (articles.length === 0) {
      console.log('No articles found. Exiting.');
      return;
    }

    // Step 2: Rank articles
    console.log('\nStep 2: Ranking articles by relevance...\n');
    const rankedArticles = rankArticles(articles, config, config.maxArticlesPerRun * 2);

    // Step 3: Filter out duplicates
    console.log('\nStep 3: Filtering duplicates...\n');
    const existingSlugs = getExistingArticleSlugs();
    const newArticles = rankedArticles.filter((article) => {
      const slug = article.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);

      // Check if we already have an article with a similar title
      for (const existingSlug of existingSlugs) {
        if (existingSlug.includes(slug.substring(0, 30))) {
          console.log(`  Skipping duplicate: ${article.title.substring(0, 50)}...`);
          return false;
        }
      }
      return true;
    });

    console.log(`  ${newArticles.length} new articles after filtering`);

    if (newArticles.length === 0) {
      console.log('\nNo new articles to process. Exiting.');
      return;
    }

    // Take only top N
    const topArticles = newArticles.slice(0, config.maxArticlesPerRun);

    // Step 4: Summarize articles
    const hasAI = !!process.env.ANTHROPIC_API_KEY;
    console.log(
      `\nStep 4: Processing articles${hasAI ? ' with AI summaries' : ' (free mode - using descriptions)'}...\n`
    );
    const scores = new Map<string, number>();
    topArticles.forEach((article) => {
      scores.set(article.url, scoreArticle(article, config));
    });

    let curatedArticles: CuratedArticle[];

    if (isDryRun) {
      // In dry run, create mock summaries
      curatedArticles = topArticles.map((article) => ({
        id: Math.random().toString(36).substring(7),
        title: article.title,
        source: article.source.name,
        sourceUrl: article.url,
        publishedAt: article.publishedAt,
        description: article.description || '',
        summary: article.description || 'No summary available.',
        relevanceScore: scores.get(article.url) || 0,
        type: 'global' as const,
        slug: `${article.publishedAt.split('T')[0]}-${article.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50)}`,
      }));
    } else {
      curatedArticles = await processArticles(topArticles, scores, {
        apiKey: process.env.ANTHROPIC_API_KEY, // Optional - falls back to descriptions if not set
      });
    }

    console.log(`\nProcessed ${curatedArticles.length} articles`);

    if (isDryRun) {
      console.log('\n--- DRY RUN RESULTS ---\n');
      curatedArticles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   Source: ${article.source}`);
        console.log(`   Type: ${article.type}`);
        console.log(`   Score: ${article.relevanceScore}`);
        console.log(`   Summary: ${article.summary.substring(0, 100)}...`);
        console.log(`   Slug: ${article.slug}`);
        console.log('');
      });
      return;
    }

    // Step 5: Create PRs
    console.log('\nStep 5: Creating GitHub PRs...\n');
    const articlesWithPRs = await createAllPRs(curatedArticles, githubOptions);

    if (articlesWithPRs.length === 0) {
      console.log('No PRs were created. Exiting.');
      return;
    }

    // Step 6: Send Slack notification
    console.log('\nStep 6: Sending Slack notification...\n');
    await sendSlackNotification(articlesWithPRs, {
      webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    });

    // Step 7: Cleanup old PRs
    console.log('\nStep 7: Cleaning up old PRs...\n');
    await closeOldPRs(githubOptions, 48);

    console.log('\n============================');
    console.log('News curation complete!');
    console.log(`Created ${articlesWithPRs.length} PRs for review.`);
  } catch (error) {
    console.error('News curation failed:', error);

    // Send error notification to Slack
    if (process.env.SLACK_WEBHOOK_URL) {
      await sendErrorNotification(error instanceof Error ? error.message : String(error), {
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
      });
    }

    process.exit(1);
  }
}

main();
