#!/usr/bin/env tsx
/**
 * News Curation Script
 *
 * This script:
 * 1. Fetches open finance news from RSS feeds, direct HTML pages, and NewsAPI.org
 * 2. Ranks articles, then applies a confidence gate for open finance / UAE programme news
 * 3. Writes original summaries and rejects any summary that is copied or ungrounded
 * 4. Opens one daily digest PR for the accepted articles
 * 5. Sends one Slack notification for that digest
 *
 * RSS feeds are configured in data/news-curation/sources.json under "rssFeeds".
 * Priority 1 feeds get higher scoring bonus than priority 2 feeds.
 *
 * Environment variables required:
 * - SLACK_WEBHOOK_URL: Slack incoming webhook URL
 * - GH_TOKEN: GitHub personal access token with repo scope
 * - GITHUB_REPOSITORY: owner/repo format (set automatically in GitHub Actions)
 *
 * Optional:
 * - NEWSAPI_KEY: NewsAPI.org API key (for additional coverage beyond RSS feeds)
 * - ANTHROPIC_API_KEY: Anthropic API key for AI summarization (without it, copied descriptions are rejected)
 * - ANTHROPIC_MODEL: Claude model id (default claude-haiku-5-5). Same provider and API key.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchNewsArticles, rankArticles, scoreArticle } from './utils/news-api-client.js';
import { fetchRssArticles, getRssSourceBonus } from './utils/rss-feed-client.js';
import { fetchHtmlArticles } from './utils/html-news-client.js';
import { processArticles, resolveSummarizerModel } from './utils/article-summarizer.js';
import { createDigestPR, closeOldPRs, fetchProposedSlugs } from './utils/github-pr-creator.js';
import {
  isDuplicateTitle,
  normalizeUrl,
  stripTrackingParams,
  titleSlug,
} from './utils/article-filters.js';
import { assessRelevance } from './utils/relevance-gate.js';
import { sendSlackNotification, sendErrorNotification } from './utils/slack-notifier.js';
import type { NewsSourceConfig, CuratedArticle, NewsApiArticle } from './types/news-curation.js';

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
function checkEnvironment(): { valid: boolean; missing: string[]; hasNewsApi: boolean } {
  // NEWSAPI_KEY is now optional - RSS feeds can work without it
  const required = ['SLACK_WEBHOOK_URL', 'GH_TOKEN'];
  const missing = required.filter((key) => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
    hasNewsApi: !!process.env.NEWSAPI_KEY,
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
  const verbose = process.argv.includes('--verbose');

  if (isDryRun) {
    console.log('DRY RUN MODE - No PRs will be created\n');
  }

  const { owner, repo } = getRepoInfo();

  // Handle cleanup mode early - only requires GH_TOKEN
  if (cleanupOnly) {
    console.log('Running cleanup only...\n');

    if (!process.env.GH_TOKEN) {
      console.error('Missing required environment variable: GH_TOKEN');
      process.exit(1);
    }

    const githubOptions = {
      token: process.env.GH_TOKEN,
      owner,
      repo,
    };

    const closed = await closeOldPRs(githubOptions, 48);
    console.log(`\nCleanup complete. Closed ${closed} stale PRs.`);
    return;
  }

  // Check environment for full curation run
  const envCheck = checkEnvironment();
  if (!envCheck.valid && !isDryRun) {
    console.error('Missing required environment variables:', envCheck.missing.join(', '));
    process.exit(1);
  }

  const config = loadConfig();

  const githubOptions = {
    token: process.env.GH_TOKEN || '',
    owner,
    repo,
  };

  try {
    // Step 1: Fetch news articles from multiple sources
    console.log('Step 1: Fetching news articles...\n');

    const allArticles: NewsApiArticle[] = [];
    const seenUrls = new Set<string>();

    // 1a: Fetch from RSS feeds (primary source - better quality)
    console.log('--- RSS Feeds (Primary) ---');
    const rssArticles = await fetchRssArticles({ config });
    for (const article of rssArticles) {
      const canonical = normalizeUrl(article.url);
      if (!seenUrls.has(canonical)) {
        seenUrls.add(canonical);
        allArticles.push(article);
      }
    }

    // 1b: Fetch from NewsAPI (secondary source - broader coverage)
    if (envCheck.hasNewsApi) {
      console.log('\n--- NewsAPI (Secondary) ---');
      const newsApiArticles = await fetchNewsArticles({
        apiKey: process.env.NEWSAPI_KEY || '',
        config,
      });
      for (const article of newsApiArticles) {
        const canonical = normalizeUrl(article.url);
        if (!seenUrls.has(canonical)) {
          seenUrls.add(canonical);
          allArticles.push(article);
        }
      }
    } else {
      console.log('\n(NewsAPI skipped - no NEWSAPI_KEY configured)');
    }

    // 1c: Direct HTML pages (CBUAE and Nebras do not publish a usable feed)
    console.log('\n--- HTML pages ---');
    const htmlArticles = await fetchHtmlArticles({ config });
    for (const article of htmlArticles) {
      const canonical = normalizeUrl(article.url);
      if (!seenUrls.has(canonical)) {
        seenUrls.add(canonical);
        allArticles.push(article);
      }
    }

    for (const article of allArticles) {
      article.url = stripTrackingParams(article.url);
    }

    console.log(`\nTotal combined articles: ${allArticles.length}`);

    if (allArticles.length === 0) {
      console.log('No articles found from any source. Exiting.');
      return;
    }

    const articles = allArticles;

    // Step 2: Rank articles (with RSS source bonus)
    console.log('\nStep 2: Ranking articles by relevance...\n');
    const rankedArticles = rankArticles(articles, config, config.maxArticlesPerRun * 3, {
      getRssBonus: (sourceName) => getRssSourceBonus(sourceName, config.rssFeeds || []),
      verbose,
    });

    if (rankedArticles.length === 0) {
      console.log(
        '\nNo articles passed the score thresholds and the relevance gate. See minRelevanceScore, regionThresholds, and minConfidence in sources.json'
      );
      console.log('Current score threshold:', config.minRelevanceScore || 0);
      console.log('Current confidence threshold:', config.minConfidence ?? 0.55);
      return;
    }

    // Step 3: Filter out duplicates - published articles and anything the
    // curator already proposed (a closed, unmerged PR is an editorial "no").
    console.log('\nStep 3: Filtering duplicates...\n');
    const existingSlugs = getExistingArticleSlugs();
    console.log(`  Existing articles: ${existingSlugs.size}`);

    const proposedSlugs = process.env.GH_TOKEN
      ? await fetchProposedSlugs(githubOptions)
      : new Set<string>();
    console.log(`  Previously proposed (open or closed PRs): ${proposedSlugs.size}`);

    const newArticles = rankedArticles.filter((article) => {
      if (isDuplicateTitle(article.title, existingSlugs)) {
        console.log(`  Skipping already published: ${article.title.substring(0, 50)}...`);
        return false;
      }
      if (isDuplicateTitle(article.title, proposedSlugs)) {
        console.log(`  Skipping already proposed: ${article.title.substring(0, 50)}...`);
        return false;
      }
      return true;
    });

    console.log(`  ${newArticles.length} new articles after filtering`);

    if (newArticles.length === 0) {
      console.log('\nNo new articles to process - all were duplicates or already published.');
      console.log('This is normal if there are no new open banking articles today.');
      return;
    }

    // Take only top N
    const topArticles = newArticles.slice(0, config.maxArticlesPerRun);

    const scores = new Map<string, number>();
    const confidences = new Map<string, number>();
    topArticles.forEach((article) => {
      scores.set(article.url, scoreArticle(article, config));
      confidences.set(article.url, assessRelevance(article, config).confidence);
    });

    if (isDryRun) {
      console.log('\n--- DRY RUN RESULTS ---\n');
      console.log(`Summariser model: ${resolveSummarizerModel()}`);
      console.log('Summaries are not generated in dry run.\n');
      topArticles.forEach((article, index) => {
        const decision = assessRelevance(article, config);
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   Source: ${article.source.name}`);
        console.log(`   URL: ${stripTrackingParams(article.url)}`);
        console.log(`   Score: ${scores.get(article.url) || 0}`);
        console.log(
          `   Confidence: ${decision.confidence.toFixed(2)} (${decision.matchedTerms.join(', ')})`
        );
        if (decision.beat) console.log(`   Beat: ${decision.beat}`);
        console.log(`   Slug: ${article.publishedAt.split('T')[0]}-${titleSlug(article.title)}`);
        console.log('');
      });
      return;
    }

    // Step 4: Summarize articles and drop copied or ungrounded prose
    const hasAI = !!process.env.ANTHROPIC_API_KEY;
    console.log(
      `\nStep 4: Processing articles${hasAI ? ` with ${resolveSummarizerModel()}` : ' (no model key — copied descriptions are rejected)'}...\n`
    );

    const curatedArticles: CuratedArticle[] = await processArticles(
      topArticles,
      scores,
      { apiKey: process.env.ANTHROPIC_API_KEY },
      confidences
    );

    for (const curated of curatedArticles) {
      const source = topArticles.find((article) => article.url === curated.sourceUrl);
      if (!source) continue;
      const decision = assessRelevance(source, config);
      if (decision.beat) curated.beat = decision.beat;
    }

    console.log(`\nProcessed ${curatedArticles.length} grounded articles`);

    if (curatedArticles.length === 0) {
      console.log('No articles left after summary grounding. No digest opened.');
      return;
    }

    // Step 5: One digest PR for the day
    const digestDate = new Date().toISOString().slice(0, 10);
    console.log(`\nStep 5: Creating daily digest PR for ${digestDate}...\n`);
    const digestPr = await createDigestPR(curatedArticles, githubOptions, digestDate);

    // Step 6: One Slack notification for the digest
    console.log('\nStep 6: Sending Slack notification...\n');
    await sendSlackNotification(
      {
        prUrl: digestPr.url,
        prNumber: digestPr.number,
        date: digestDate,
        articles: curatedArticles,
      },
      { webhookUrl: process.env.SLACK_WEBHOOK_URL || '' }
    );

    // Step 7: Cleanup old PRs
    console.log('\nStep 7: Cleaning up old PRs...\n');
    await closeOldPRs(githubOptions, 48);

    console.log('\n============================');
    console.log('News curation complete!');
    console.log(`Opened one digest PR with ${curatedArticles.length} articles.`);
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
