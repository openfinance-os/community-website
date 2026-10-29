// NewsAPI.org Client for fetching open finance news
import type {
  NewsApiArticle,
  NewsApiResponse,
  NewsSourceConfig,
  ContentQualityScore,
  ArticleScoreBreakdown,
} from '../types/news-curation.js';
import {
  inferRegion,
  normalizeUrl,
  preFilterArticle,
  stripTrackingParams,
  summarizeRejections,
  type RejectionReason,
} from './article-filters.js';
import { assessRelevance } from './relevance-gate.js';

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
          // Skip duplicates (ignoring tracking parameters)
          const canonical = normalizeUrl(article.url);
          if (seenUrls.has(canonical)) continue;
          seenUrls.add(canonical);

          // Skip articles without required fields
          if (!article.title || !article.url || !article.description) continue;

          // Skip [Removed] articles
          if (article.title === '[Removed]' || article.content === '[Removed]') continue;

          allArticles.push({ ...article, url: stripTrackingParams(article.url) });
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

export interface ScoreOptions {
  rssSourceBonus?: number; // Bonus points for articles from RSS feeds
  verbose?: boolean; // Log detailed score breakdown
  now?: Date; // Reference time for recency (defaults to Date.now())
}

/**
 * Core open banking / open finance vocabulary. An article that mentions none
 * of these is, at best, adjacent fintech news.
 */
export const CORE_TERMS: ReadonlyArray<{ term: string; weight: number }> = [
  { term: 'open banking', weight: 25 },
  { term: 'open finance', weight: 25 },
  { term: 'openbanking', weight: 25 },
  { term: 'openfinance', weight: 25 },
  { term: 'al tareq', weight: 25 },
  { term: 'altareq', weight: 25 },
  { term: 'nebras', weight: 22 },
  { term: 'api hub', weight: 22 },
  { term: 'ozone connect', weight: 22 },
  { term: 'ozone api', weight: 18 },
  { term: 'caap', weight: 18 },
  { term: 'aani', weight: 18 },
  { term: 'service initiation', weight: 18 },
  { term: 'bank service initiation', weight: 18 },
  { term: 'bank data sharing', weight: 18 },
  { term: 'confirmation of payee', weight: 15 },
  { term: 'deemed licence', weight: 18 },
  { term: 'deemed license', weight: 18 },
  { term: 'open finance framework', weight: 22 },
  { term: 'psd2', weight: 20 },
  { term: 'psd3', weight: 20 },
  { term: 'financial data operating', weight: 20 },
  { term: 'account aggregation', weight: 18 },
  { term: 'banking api', weight: 18 },
  { term: 'payment initiation', weight: 18 },
  { term: 'account information service', weight: 18 },
  { term: 'variable recurring payment', weight: 18 },
  { term: 'pay by bank', weight: 15 },
  { term: 'pay-by-bank', weight: 15 },
  { term: 'aisp', weight: 15 },
  { term: 'pisp', weight: 15 },
  { term: 'third party provider', weight: 15 },
  { term: 'third-party provider', weight: 15 },
  { term: 'tpp regulation', weight: 15 },
  { term: 'vrp', weight: 15 },
  { term: 'fdo', weight: 15 },
  { term: 'strong customer authentication', weight: 15 },
  { term: 'screen scraping', weight: 12 },
  { term: 'data sharing banking', weight: 12 },
  { term: 'consumer data right', weight: 12 },
  { term: 'fdata', weight: 12 },
  { term: 'premium api', weight: 12 },
  { term: 'consent management', weight: 12 },
  { term: 'sca', weight: 10 },
];

/**
 * Whole-word match. Short acronyms such as "sca", "vrp" and "fdo" otherwise
 * match inside unrelated words ("scale", "escalate"), which is one of the
 * ways off-topic articles were reaching the top of the ranking.
 */
export function matchesTerm(text: string, term: string): boolean {
  if (term.length > 4 || term.includes(' ') || term.includes('-')) {
    return text.includes(term);
  }
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(text);
}

/** True when the article mentions at least one core term anywhere. */
export function hasCoreTerm(article: NewsApiArticle): boolean {
  const text =
    `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  return CORE_TERMS.some(({ term }) => matchesTerm(text, term));
}

/** Resolve the minimum score for an article's region. */
export function thresholdForRegion(
  region: 'uae' | 'mena' | 'global',
  config: NewsSourceConfig
): number {
  const base = config.minRelevanceScore || 0;
  const tiered = config.regionThresholds?.[region];
  return typeof tiered === 'number' ? tiered : base;
}

/**
 * Assess content quality of an article
 */
export function assessContentQuality(
  article: NewsApiArticle,
  config: NewsSourceConfig
): ContentQualityScore {
  const minDescLength = config.minDescriptionLength || 50;
  const description = article.description || '';
  const title = article.title.toLowerCase();

  // Check description length
  const descriptionLength = description.length >= minDescLength ? 5 : 0;

  // Check for author attribution (not generic "Staff" or empty)
  const hasAuthor = !!(
    article.author &&
    !article.author.toLowerCase().includes('staff') &&
    article.author.length > 2
  );

  // Check for promotional signals
  const promoSignals = [
    'sponsored',
    'partner content',
    'advertorial',
    'press release',
    'paid content',
    'brand content',
  ];
  const isPromotional = promoSignals.some(
    (s) => title.includes(s) || description.toLowerCase().includes(s)
  );

  // Check for concrete numbers (suggests factual reporting)
  const hasNumbers =
    /\d+/.test(title) || /\$[\d,]+|\d+%|\d+ million|\d+ billion/i.test(description);

  // Check for quotes (suggests original reporting)
  const hasQuotes = description.includes('"') || description.includes('"');

  // Calculate total quality score
  let totalScore = 0;
  totalScore += descriptionLength;
  totalScore += hasAuthor ? 3 : 0;
  totalScore += isPromotional ? -15 : 0;
  totalScore += hasNumbers ? 3 : 0;
  totalScore += hasQuotes ? 2 : 0;

  return {
    descriptionLength,
    hasAuthor,
    isPromotional,
    hasNumbers,
    hasQuotes,
    totalScore,
  };
}

/**
 * Check if article is breaking news
 */
export function isBreakingNews(article: NewsApiArticle, config: NewsSourceConfig): boolean {
  const breakingSignals = config.breakingNewsSignals || [
    'breaking:',
    'exclusive:',
    'just in:',
    'announced today',
    'first of its kind',
    'launches',
    'unveils',
  ];

  const title = article.title.toLowerCase();
  const publishedDate = new Date(article.publishedAt);
  const hoursAgo = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);

  // Breaking news must be recent (within 24 hours, not in the future) and
  // have a breaking signal
  return (
    hoursAgo >= -1 &&
    hoursAgo < 24 &&
    breakingSignals.some((signal) => title.includes(signal.toLowerCase()))
  );
}

export function scoreArticle(
  article: NewsApiArticle,
  config: NewsSourceConfig,
  options: ScoreOptions = {}
): number {
  const breakdown: ArticleScoreBreakdown = {
    coreTerms: 0,
    regulatory: 0,
    relatedTerms: 0,
    regional: 0,
    companies: 0,
    preferredSource: 0,
    recency: 0,
    rssBonus: 0,
    breakingNews: 0,
    contentQuality: 0,
    penalties: 0,
    total: 0,
  };

  const titleLower = article.title.toLowerCase();
  const descLower = (article.description || '').toLowerCase();
  const contentLower = (article.content || '').toLowerCase();
  const combinedText = `${titleLower} ${descLower} ${contentLower}`;

  // Apply RSS source bonus if provided
  if (options.rssSourceBonus) {
    breakdown.rssBonus = options.rssSourceBonus;
  }

  // === CORE OPEN BANKING/FINANCE TERMS (highest weight) ===
  for (const { term, weight } of CORE_TERMS) {
    if (matchesTerm(titleLower, term)) {
      breakdown.coreTerms += weight * 2; // Double weight for title matches
    } else if (matchesTerm(combinedText, term)) {
      breakdown.coreTerms += weight;
    }
  }

  // === REGULATORY BODIES (from config or defaults) ===
  const regulatoryBodies = config.regulatoryBodies || [
    { name: 'cbuae', fullName: 'central bank of the uae', region: 'uae', weight: 20 },
    { name: 'fca', fullName: 'financial conduct authority', region: 'uk', weight: 15 },
    { name: 'eba', fullName: 'european banking authority', region: 'europe', weight: 12 },
    { name: 'obie', fullName: 'open banking implementation entity', region: 'uk', weight: 15 },
  ];

  for (const body of regulatoryBodies) {
    const nameLower = body.name.toLowerCase();
    const fullNameLower = body.fullName.toLowerCase();
    if (matchesTerm(titleLower, nameLower) || matchesTerm(titleLower, fullNameLower)) {
      breakdown.regulatory += body.weight * 1.5; // Bonus for title mention
    } else if (matchesTerm(combinedText, nameLower) || matchesTerm(combinedText, fullNameLower)) {
      breakdown.regulatory += body.weight;
    }
  }

  // Additional regulatory terms
  const regulatoryTerms = [
    { term: 'open banking regulation', weight: 15 },
    { term: 'banking license', weight: 8 },
    { term: 'fintech regulation', weight: 8 },
    { term: 'regulatory sandbox', weight: 10 },
    { term: 'fintech license', weight: 10 },
  ];

  for (const { term, weight } of regulatoryTerms) {
    if (combinedText.includes(term)) {
      breakdown.regulatory += weight;
    }
  }

  // === KEY COMPANIES (from config or defaults) ===
  const keyCompanies = config.keyCompanies || [
    { name: 'lean technologies', region: 'uae', weight: 15 },
    { name: 'tarabut gateway', region: 'uae', weight: 15 },
    { name: 'plaid', region: 'global', weight: 10 },
    { name: 'truelayer', region: 'global', weight: 10 },
    { name: 'tink', region: 'global', weight: 10 },
    { name: 'yapily', region: 'global', weight: 10 },
  ];

  for (const company of keyCompanies) {
    // Whole-word matching for short names: "Tink" must not match "thinking",
    // "Spare" must not match "spare capacity" mid-sentence any more than the
    // scorer can help, and "Volt" must not match "Revolut".
    const nameLower = company.name.toLowerCase();
    if (matchesTerm(titleLower, nameLower)) {
      breakdown.companies += company.weight * 1.5; // Bonus for title mention
    } else if (matchesTerm(combinedText, nameLower)) {
      breakdown.companies += company.weight;
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
    { term: 'payment orchestration', weight: 8 },
    { term: 'a2a payment', weight: 10 },
    { term: 'account-to-account', weight: 10 },
    { term: 'instant payment', weight: 6 },
    { term: 'real-time payment', weight: 6 },
  ];

  for (const { term, weight } of relatedTerms) {
    if (combinedText.includes(term)) {
      breakdown.relatedTerms += weight;
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
    { term: 'difc', weight: 8 },
    { term: 'adgm', weight: 8 },
    { term: 'qatar', weight: 4 },
    { term: 'kuwait', weight: 4 },
    { term: 'oman', weight: 4 },
  ];

  for (const { term, weight } of regionTerms) {
    if (combinedText.includes(term)) {
      breakdown.regional += weight;
    }
  }

  // === PREFERRED SOURCES BONUS ===
  const sourceName = article.source.name.toLowerCase();
  for (const preferred of config.preferredSources) {
    if (sourceName.includes(preferred.toLowerCase())) {
      breakdown.preferredSource = 10;
      break;
    }
  }

  // === RECENCY BONUS (smoother decay) ===
  const publishedDate = new Date(article.publishedAt);
  const nowMs = (options.now || new Date()).getTime();
  // Future-dated items (event listings) previously produced a negative
  // "hours ago" and an unbounded bonus; clamp so the bonus never exceeds 10.
  const hoursAgo = isNaN(publishedDate.getTime())
    ? 72
    : Math.max(0, (nowMs - publishedDate.getTime()) / (1000 * 60 * 60));
  // Smooth decay: starts at 10 points, decays over 72 hours
  breakdown.recency = Math.max(0, Math.min(10, Math.round(10 - hoursAgo / 7.2)));

  // === BREAKING NEWS BONUS ===
  if (isBreakingNews(article, config)) {
    breakdown.breakingNews = config.breakingNewsBonus || 20;
  }

  // === CONTENT QUALITY SCORE ===
  const qualityScore = assessContentQuality(article, config);
  const qualityWeight = config.contentQualityWeight || 0.2;
  breakdown.contentQuality = Math.round(qualityScore.totalScore * (1 + qualityWeight));

  // === NEGATIVE SIGNALS (reduce score for off-topic) ===
  const negativeTerms = config.excludedKeywords || [
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
    if (combinedText.includes(term.toLowerCase())) {
      breakdown.penalties -= 10;
    }
  }

  // Calculate total score
  breakdown.total =
    breakdown.coreTerms +
    breakdown.regulatory +
    breakdown.relatedTerms +
    breakdown.regional +
    breakdown.companies +
    breakdown.preferredSource +
    breakdown.recency +
    breakdown.rssBonus +
    breakdown.breakingNews +
    breakdown.contentQuality +
    breakdown.penalties;

  // Log breakdown if verbose
  if (options.verbose) {
    console.log(`  Score breakdown for "${article.title.substring(0, 40)}...":`);
    console.log(`    Core terms: ${breakdown.coreTerms}`);
    console.log(`    Regulatory: ${breakdown.regulatory}`);
    console.log(`    Related: ${breakdown.relatedTerms}`);
    console.log(`    Regional: ${breakdown.regional}`);
    console.log(`    Companies: ${breakdown.companies}`);
    console.log(`    Preferred source: ${breakdown.preferredSource}`);
    console.log(`    Recency: ${breakdown.recency}`);
    console.log(`    RSS bonus: ${breakdown.rssBonus}`);
    console.log(`    Breaking news: ${breakdown.breakingNews}`);
    console.log(`    Content quality: ${breakdown.contentQuality}`);
    console.log(`    Penalties: ${breakdown.penalties}`);
    console.log(`    TOTAL: ${breakdown.total}`);
  }

  return Math.max(0, breakdown.total); // Don't go negative
}

/**
 * Get detailed score breakdown for an article
 */
export function getScoreBreakdown(
  article: NewsApiArticle,
  config: NewsSourceConfig,
  rssSourceBonus: number = 0
): ArticleScoreBreakdown {
  // Score with verbose logging temporarily disabled
  const breakdown: ArticleScoreBreakdown = {
    coreTerms: 0,
    regulatory: 0,
    relatedTerms: 0,
    regional: 0,
    companies: 0,
    preferredSource: 0,
    recency: 0,
    rssBonus: rssSourceBonus,
    breakingNews: 0,
    contentQuality: 0,
    penalties: 0,
    total: 0,
  };

  // Re-calculate with breakdown tracking (same logic as scoreArticle)
  breakdown.total = scoreArticle(article, config, { rssSourceBonus });

  return breakdown;
}

export interface RankOptions {
  getRssBonus?: (sourceName: string) => number;
  verbose?: boolean;
  now?: Date;
}

export function rankArticles(
  articles: NewsApiArticle[],
  config: NewsSourceConfig,
  limit: number = 5,
  options: RankOptions = {}
): NewsApiArticle[] {
  const minDescLength = config.minDescriptionLength || 50;
  const now = options.now || new Date();
  const rejections: RejectionReason[] = [];
  let shortDescriptions = 0;
  let promotional = 0;

  // Pre-filter: editorial rules first (events, promos, dates, domains),
  // then content quality.
  const qualityFiltered = articles.filter((article) => {
    const editorial = preFilterArticle(article, config, now);
    if (!editorial.keep) {
      if (editorial.reason) rejections.push(editorial.reason);
      if (options.verbose) {
        console.log(`  Rejected (${editorial.reason}): ${article.title.substring(0, 60)}`);
      }
      return false;
    }

    // Skip articles with very short descriptions
    if ((article.description?.length || 0) < minDescLength) {
      shortDescriptions++;
      return false;
    }

    // Skip promotional content
    const quality = assessContentQuality(article, config);
    if (quality.isPromotional) {
      promotional++;
      return false;
    }

    // Global stories must at least be about open banking / open finance.
    if (config.requireCoreTermForGlobal && inferRegion(article) === 'global') {
      if (!hasCoreTerm(article)) {
        rejections.push('no-core-term');
        if (options.verbose) {
          console.log(`  Rejected (no-core-term): ${article.title.substring(0, 60)}`);
        }
        return false;
      }
    }

    return true;
  });

  console.log(`Pre-filtered ${articles.length} articles to ${qualityFiltered.length}`);
  if (rejections.length > 0) {
    console.log(`  Editorial rejections: ${summarizeRejections(rejections)}`);
  }
  if (shortDescriptions > 0 || promotional > 0) {
    console.log(
      `  Quality rejections: short-description=${shortDescriptions}, promotional=${promotional}`
    );
  }

  // Score all articles
  const scoredArticles = qualityFiltered.map((article) => {
    const rssBonus = options.getRssBonus ? options.getRssBonus(article.source.name) : 0;
    const region = inferRegion(article);
    return {
      article,
      region,
      score: scoreArticle(article, config, {
        rssSourceBonus: rssBonus,
        verbose: options.verbose,
        now,
      }),
      isBreaking: isBreakingNews(article, config),
      threshold: thresholdForRegion(region, config),
    };
  });

  // Sort by score descending, with breaking news getting priority
  scoredArticles.sort((a, b) => {
    // Breaking news always comes first if scores are close
    if (a.isBreaking && !b.isBreaking && b.score - a.score < 10) return -1;
    if (b.isBreaking && !a.isBreaking && a.score - b.score < 10) return 1;
    return b.score - a.score;
  });

  // Show score distribution
  if (scoredArticles.length > 0) {
    const scores = scoredArticles.map((a) => a.score);
    const breakingCount = scoredArticles.filter((a) => a.isBreaking).length;
    console.log(`Score distribution: max=${scores[0]}, min=${scores[scores.length - 1]}`);
    console.log(`Breaking news articles: ${breakingCount}`);
  }

  // Filter by minimum score for the article's region (UAE stories need a
  // lower bar than global ones on a UAE community site).
  const aboveThreshold = scoredArticles.filter((item) => item.score >= item.threshold);

  const gateReasons = new Map<string, number>();
  const relevantArticles = aboveThreshold.filter((item) => {
    const decision = assessRelevance(item.article, config);
    if (!decision.accept) {
      gateReasons.set(decision.reason, (gateReasons.get(decision.reason) || 0) + 1);
      if (options.verbose) {
        console.log(
          `  Rejected (${decision.reason}, confidence ${decision.confidence.toFixed(2)}): ${item.article.title.substring(0, 60)}`
        );
      }
      return false;
    }
    return true;
  });

  const thresholdSummary = (['uae', 'mena', 'global'] as const)
    .map((region) => `${region}>=${thresholdForRegion(region, config)}`)
    .join(', ');
  const gateSummary =
    gateReasons.size === 0
      ? 'none'
      : [...gateReasons.entries()].map(([reason, count]) => `${reason}=${count}`).join(', ');
  console.log(
    `Filtered ${scoredArticles.length} articles to ${aboveThreshold.length} above region thresholds (${thresholdSummary})`
  );
  console.log(
    `Relevance gate kept ${relevantArticles.length} of ${aboveThreshold.length} (rejected: ${gateSummary})`
  );

  // Log top articles with scores
  console.log('\nTop ranked articles:');
  relevantArticles.slice(0, limit).forEach((item, index) => {
    const breakingLabel = item.isBreaking ? ' [BREAKING]' : '';
    console.log(
      `  ${index + 1}. [Score: ${item.score}] [${item.region.toUpperCase()}]${breakingLabel} ${item.article.title.substring(0, 60)}...`
    );
  });

  if (relevantArticles.length === 0 && aboveThreshold.length > 0) {
    console.log('  No articles passed the relevance gate.');
  } else if (relevantArticles.length === 0 && scoredArticles.length > 0) {
    console.log('  No articles met the minimum score threshold.');
    console.log('  Top 3 rejected articles:');
    scoredArticles.slice(0, 3).forEach((item, index) => {
      console.log(
        `    ${index + 1}. [Score: ${item.score}] ${item.article.title.substring(0, 50)}...`
      );
    });
  }

  return relevantArticles.slice(0, limit).map((item) => item.article);
}
