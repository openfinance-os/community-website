// AI-powered article summarization using Anthropic Claude API
// Falls back to article description if no API key is provided (free mode)
import type { NewsApiArticle, CuratedArticle } from '../types/news-curation.js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export interface SummarizerOptions {
  apiKey?: string; // Optional - falls back to description if not provided
  model?: string;
}

interface AnthropicResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

interface SummaryResult {
  summary: string;
  type: 'global' | 'community' | 'milestone' | 'official' | 'opinion';
}

function generateSlug(title: string, date: string): string {
  const datePrefix = date.split('T')[0];
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
    .replace(/-$/, '');

  return `${datePrefix}-${slug}`;
}

function generateArticleId(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Determine article type based on keywords (used when no AI available)
function inferArticleType(
  article: NewsApiArticle
): 'global' | 'community' | 'milestone' | 'official' | 'opinion' {
  const text =
    `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();

  // Check for official/regulatory content
  if (
    text.includes('cbuae') ||
    text.includes('central bank') ||
    text.includes('regulation') ||
    text.includes('regulatory') ||
    text.includes('license') ||
    text.includes('framework')
  ) {
    return 'official';
  }

  // Check for milestone content
  if (
    text.includes('first') ||
    text.includes('launch') ||
    text.includes('milestone') ||
    text.includes('achievement') ||
    text.includes('record')
  ) {
    return 'milestone';
  }

  // Check for opinion/analysis
  if (
    text.includes('opinion') ||
    text.includes('analysis') ||
    text.includes('commentary') ||
    text.includes('perspective')
  ) {
    return 'opinion';
  }

  // Check for community/local
  if (
    text.includes('uae') ||
    text.includes('dubai') ||
    text.includes('abu dhabi') ||
    text.includes('emirates')
  ) {
    return 'community';
  }

  return 'global';
}

// Simple extractive summary when no AI is available
function extractSummary(article: NewsApiArticle): string {
  // Use description if available and reasonable length
  if (article.description && article.description.length >= 50) {
    // Clean up and truncate if needed
    let summary = article.description.trim();
    if (summary.length > 300) {
      summary = summary.substring(0, 297) + '...';
    }
    return summary;
  }

  // Fall back to content excerpt
  if (article.content) {
    // Remove the "[+XXXX chars]" suffix that NewsAPI adds
    const cleanContent = article.content.replace(/\[\+\d+ chars\]$/, '').trim();
    if (cleanContent.length > 300) {
      return cleanContent.substring(0, 297) + '...';
    }
    return cleanContent;
  }

  return 'Read the full article for more details.';
}

async function callClaude(
  prompt: string,
  systemPrompt: string,
  options: SummarizerOptions
): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': options.apiKey!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: options.model || 'claude-3-haiku-20240307',
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data: AnthropicResponse = await response.json();
  return data.content[0]?.text || '';
}

export async function summarizeArticle(
  article: NewsApiArticle,
  options: SummarizerOptions
): Promise<SummaryResult> {
  // If no API key, use free mode (extractive summary)
  if (!options.apiKey) {
    console.log('  (Using free mode - no AI summarization)');
    return {
      summary: extractSummary(article),
      type: inferArticleType(article),
    };
  }

  const systemPrompt = `You are a news summarizer for the UAE Open Finance community website.
Your task is to:
1. Write a 2-3 sentence summary of the article that is informative and relevant to the open finance/fintech community
2. Classify the article type as one of: global (international news), community (local ecosystem), milestone (significant achievement), official (regulatory/government), opinion (analysis/commentary)

Respond in JSON format only: {"summary": "...", "type": "..."}`;

  const prompt = `Summarize this article for the UAE Open Finance community:

Title: ${article.title}
Source: ${article.source.name}
Description: ${article.description || 'N/A'}
Content: ${article.content || 'N/A'}

Respond only with valid JSON.`;

  try {
    const response = await callClaude(prompt, systemPrompt, options);

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      summary: result.summary || article.description || '',
      type: result.type || 'global',
    };
  } catch (error) {
    console.warn(`  Failed to summarize with AI, using fallback: ${error}`);
    return {
      summary: extractSummary(article),
      type: inferArticleType(article),
    };
  }
}

export async function processArticles(
  articles: NewsApiArticle[],
  scores: Map<string, number>,
  options: SummarizerOptions
): Promise<CuratedArticle[]> {
  const curatedArticles: CuratedArticle[] = [];
  const useAI = !!options.apiKey;

  if (!useAI) {
    console.log('\nNo ANTHROPIC_API_KEY provided - using free mode (article descriptions)\n');
  }

  for (const article of articles) {
    console.log(`Processing: ${article.title.substring(0, 50)}...`);

    try {
      const { summary, type } = await summarizeArticle(article, options);

      const curated: CuratedArticle = {
        id: generateArticleId(article.url),
        title: article.title,
        source: article.source.name,
        sourceUrl: article.url,
        publishedAt: article.publishedAt,
        description: article.description || '',
        summary,
        relevanceScore: scores.get(article.url) || 0,
        type,
        slug: generateSlug(article.title, article.publishedAt),
      };

      curatedArticles.push(curated);

      // Small delay only if using AI to avoid rate limiting
      if (useAI) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Failed to process article: ${article.title}`, error);
    }
  }

  return curatedArticles;
}
