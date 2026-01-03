// NewsAPI.org Client for fetching open finance news
import type { NewsApiArticle, NewsApiResponse, NewsSourceConfig } from '../types/news-curation.js';

const NEWSAPI_BASE_URL = 'https://newsapi.org/v2';

export interface FetchNewsOptions {
  apiKey: string;
  config: NewsSourceConfig;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `API request failed: ${response.status} ${response.statusText} - ${errorBody}`
        );
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt}/${retries} failed: ${lastError.message}`);

      if (attempt < retries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Failed to fetch after retries');
}

export async function fetchNewsArticles(options: FetchNewsOptions): Promise<NewsApiArticle[]> {
  const { apiKey, config } = options;
  const allArticles: NewsApiArticle[] = [];
  const seenUrls = new Set<string>();

  // Calculate date range (lookback hours)
  const fromDate = new Date();
  fromDate.setHours(fromDate.getHours() - config.lookbackHours);
  const fromDateStr = fromDate.toISOString().split('T')[0];

  console.log(`Fetching news from ${fromDateStr} (last ${config.lookbackHours} hours)...`);

  // Search for each keyword
  for (const keyword of config.keywords) {
    try {
      const params = new URLSearchParams({
        q: keyword,
        from: fromDateStr,
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: '20',
      });

      // Add excluded domains if any
      if (config.excludeDomains.length > 0) {
        params.set('excludeDomains', config.excludeDomains.join(','));
      }

      const url = `${NEWSAPI_BASE_URL}/everything?${params.toString()}`;
      console.log(`Searching for: "${keyword}"...`);

      const response = await fetchWithRetry(url, {
        headers: {
          'X-Api-Key': apiKey,
          Accept: 'application/json',
        },
      });

      const data: NewsApiResponse = await response.json();

      if (data.status === 'ok' && data.articles) {
        for (const article of data.articles) {
          // Skip duplicates
          if (seenUrls.has(article.url)) continue;
          seenUrls.add(article.url);

          // Skip articles without required fields
          if (!article.title || !article.url || !article.description) continue;

          // Skip [Removed] articles
          if (article.title === '[Removed]' || article.content === '[Removed]') continue;

          allArticles.push(article);
        }
        console.log(`  Found ${data.articles.length} articles for "${keyword}"`);
      }
    } catch (error) {
      console.error(`Failed to fetch for keyword "${keyword}":`, error);
    }
  }

  console.log(`\nTotal unique articles found: ${allArticles.length}`);

  return allArticles;
}

export function scoreArticle(article: NewsApiArticle, config: NewsSourceConfig): number {
  let score = 0;
  const titleLower = article.title.toLowerCase();
  const descLower = (article.description || '').toLowerCase();
  const contentLower = (article.content || '').toLowerCase();
  const combinedText = `${titleLower} ${descLower} ${contentLower}`;

  // Score based on keyword presence in title (higher weight)
  for (const keyword of config.keywords) {
    const keywordLower = keyword.toLowerCase();
    if (titleLower.includes(keywordLower)) {
      score += 10;
    }
    if (descLower.includes(keywordLower)) {
      score += 5;
    }
    if (contentLower.includes(keywordLower)) {
      score += 2;
    }
  }

  // Bonus for UAE/Middle East specific content
  const regionKeywords = [
    'uae',
    'dubai',
    'abu dhabi',
    'cbuae',
    'middle east',
    'gulf',
    'gcc',
    'emirates',
  ];
  for (const regionKw of regionKeywords) {
    if (combinedText.includes(regionKw)) {
      score += 8;
    }
  }

  // Bonus for fintech/banking specific content
  const fintechKeywords = ['fintech', 'api', 'tpp', 'third-party', 'psd2', 'payment', 'banking'];
  for (const fintechKw of fintechKeywords) {
    if (combinedText.includes(fintechKw)) {
      score += 3;
    }
  }

  // Bonus for preferred sources
  const sourceName = article.source.name.toLowerCase();
  for (const preferred of config.preferredSources) {
    if (sourceName.includes(preferred.toLowerCase())) {
      score += 15;
    }
  }

  // Recency bonus (articles from last 24 hours get a boost)
  const publishedDate = new Date(article.publishedAt);
  const hoursAgo = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 24) {
    score += 5;
  }

  return score;
}

export function rankArticles(
  articles: NewsApiArticle[],
  config: NewsSourceConfig,
  limit: number = 5
): NewsApiArticle[] {
  // Score and sort articles
  const scoredArticles = articles.map((article) => ({
    article,
    score: scoreArticle(article, config),
  }));

  scoredArticles.sort((a, b) => b.score - a.score);

  // Log top articles with scores
  console.log('\nTop ranked articles:');
  scoredArticles.slice(0, limit).forEach((item, index) => {
    console.log(`  ${index + 1}. [Score: ${item.score}] ${item.article.title.substring(0, 60)}...`);
  });

  return scoredArticles.slice(0, limit).map((item) => item.article);
}
