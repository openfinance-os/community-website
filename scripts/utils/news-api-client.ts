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
      console.log(`Searching for: ${keyword}...`);

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
        console.log(`  Found ${data.articles.length} articles for ${keyword}`);
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

  // === CORE OPEN BANKING/FINANCE TERMS (highest weight) ===
  // These are the exact phrases we care about most
  const coreTerms = [
    { term: 'open banking', weight: 25 },
    { term: 'open finance', weight: 25 },
    { term: 'openbanking', weight: 25 },
    { term: 'openfinance', weight: 25 },
    { term: 'psd2', weight: 20 },
    { term: 'psd3', weight: 20 },
    { term: 'account aggregation', weight: 18 },
    { term: 'banking api', weight: 18 },
    { term: 'payment initiation', weight: 18 },
    { term: 'account information service', weight: 18 },
    { term: 'aisp', weight: 15 },
    { term: 'pisp', weight: 15 },
    { term: 'third party provider', weight: 15 },
    { term: 'third-party provider', weight: 15 },
    { term: 'tpp regulation', weight: 15 },
    { term: 'screen scraping', weight: 12 },
    { term: 'data sharing banking', weight: 12 },
    { term: 'consumer data right', weight: 12 },
    { term: 'fdata', weight: 12 },
  ];

  for (const { term, weight } of coreTerms) {
    if (titleLower.includes(term)) {
      score += weight * 2; // Double weight for title matches
    } else if (combinedText.includes(term)) {
      score += weight;
    }
  }

  // === REGULATORY/FRAMEWORK TERMS ===
  const regulatoryTerms = [
    { term: 'cbuae', weight: 15 },
    { term: 'central bank uae', weight: 12 },
    { term: 'fca open banking', weight: 12 },
    { term: 'eba guidelines', weight: 10 },
    { term: 'open banking regulation', weight: 15 },
    { term: 'banking license', weight: 8 },
    { term: 'fintech regulation', weight: 8 },
  ];

  for (const { term, weight } of regulatoryTerms) {
    if (combinedText.includes(term)) {
      score += weight;
    }
  }

  // === RELATED FINTECH TERMS (lower weight) ===
  const relatedTerms = [
    { term: 'fintech', weight: 3 },
    { term: 'neobank', weight: 5 },
    { term: 'challenger bank', weight: 5 },
    { term: 'embedded finance', weight: 8 },
    { term: 'banking as a service', weight: 10 },
    { term: 'baas', weight: 8 },
    { term: 'api banking', weight: 10 },
    { term: 'digital banking', weight: 3 },
  ];

  for (const { term, weight } of relatedTerms) {
    if (combinedText.includes(term)) {
      score += weight;
    }
  }

  // === REGIONAL BONUS (UAE/GCC focus) ===
  const regionTerms = [
    { term: 'uae', weight: 8 },
    { term: 'dubai', weight: 6 },
    { term: 'abu dhabi', weight: 6 },
    { term: 'emirates', weight: 5 },
    { term: 'gulf', weight: 4 },
    { term: 'gcc', weight: 5 },
    { term: 'middle east', weight: 4 },
    { term: 'saudi', weight: 4 },
    { term: 'bahrain', weight: 5 }, // Bahrain has advanced open banking
    { term: 'uk open banking', weight: 8 },
    { term: 'europe', weight: 3 },
  ];

  for (const { term, weight } of regionTerms) {
    if (combinedText.includes(term)) {
      score += weight;
    }
  }

  // === PREFERRED SOURCES BONUS ===
  const sourceName = article.source.name.toLowerCase();
  for (const preferred of config.preferredSources) {
    if (sourceName.includes(preferred.toLowerCase())) {
      score += 10;
    }
  }

  // === RECENCY BONUS ===
  const publishedDate = new Date(article.publishedAt);
  const hoursAgo = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 12) {
    score += 8;
  } else if (hoursAgo < 24) {
    score += 5;
  } else if (hoursAgo < 48) {
    score += 2;
  }

  // === NEGATIVE SIGNALS (reduce score for off-topic) ===
  const negativeTerms = [
    'crypto',
    'bitcoin',
    'ethereum',
    'nft',
    'metaverse',
    'web3',
    'defi',
    'blockchain trading',
    'stock market',
    'forex',
    'investment tips',
  ];

  for (const term of negativeTerms) {
    if (combinedText.includes(term)) {
      score -= 10;
    }
  }

  return Math.max(0, score); // Don't go negative
}

export function rankArticles(
  articles: NewsApiArticle[],
  config: NewsSourceConfig,
  limit: number = 5
): NewsApiArticle[] {
  const minScore = config.minRelevanceScore || 0;

  // Score all articles
  const scoredArticles = articles.map((article) => ({
    article,
    score: scoreArticle(article, config),
  }));

  // Sort by score descending first to see top scores
  scoredArticles.sort((a, b) => b.score - a.score);

  // Show score distribution
  if (scoredArticles.length > 0) {
    const scores = scoredArticles.map((a) => a.score);
    console.log(`Score distribution: max=${scores[0]}, min=${scores[scores.length - 1]}`);
  }

  // Filter by minimum score
  const relevantArticles = scoredArticles.filter((item) => item.score >= minScore);

  console.log(
    `Filtered ${scoredArticles.length} articles to ${relevantArticles.length} with score >= ${minScore}`
  );

  // Log top articles with scores
  console.log('\nTop ranked articles:');
  relevantArticles.slice(0, limit).forEach((item, index) => {
    console.log(`  ${index + 1}. [Score: ${item.score}] ${item.article.title.substring(0, 60)}...`);
  });

  if (relevantArticles.length === 0 && scoredArticles.length > 0) {
    console.log('  No articles met the minimum score threshold.');
    console.log('  Top 3 rejected articles:');
    scoredArticles.slice(0, 3).forEach((item, index) => {
      console.log(`    ${index + 1}. [Score: ${item.score}] ${item.article.title.substring(0, 50)}...`);
    });
  }

  return relevantArticles.slice(0, limit).map((item) => item.article);
}
