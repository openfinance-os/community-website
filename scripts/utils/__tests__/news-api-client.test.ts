import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NewsApiArticle, NewsSourceConfig } from '../../types/news-curation.js';

// =====================
// Score function implementation (copied for testing)
// =====================

interface ScoreOptions {
  rssSourceBonus?: number;
}

function scoreArticle(
  article: NewsApiArticle,
  config: NewsSourceConfig,
  options: ScoreOptions = {}
): number {
  let score = 0;
  const titleLower = article.title.toLowerCase();
  const descLower = (article.description || '').toLowerCase();
  const contentLower = (article.content || '').toLowerCase();
  const combinedText = `${titleLower} ${descLower} ${contentLower}`;

  // Apply RSS source bonus if provided
  if (options.rssSourceBonus) {
    score += options.rssSourceBonus;
  }

  // === CORE OPEN BANKING/FINANCE TERMS (highest weight) ===
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
    { term: 'bahrain', weight: 5 },
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

  return Math.max(0, score);
}

// =====================
// Test fixtures
// =====================

function createMockArticle(overrides: Partial<NewsApiArticle> = {}): NewsApiArticle {
  return {
    source: { id: 'test-source', name: 'Test News' },
    author: 'Test Author',
    title: 'Test Article',
    description: 'Test description',
    url: 'https://example.com/test',
    urlToImage: null,
    publishedAt: new Date().toISOString(),
    content: 'Test content',
    ...overrides,
  };
}

function createMockConfig(overrides: Partial<NewsSourceConfig> = {}): NewsSourceConfig {
  return {
    keywords: ['open banking', 'fintech'],
    excludeDomains: [],
    preferredSources: ['Financial Times', 'Reuters'],
    maxArticlesPerRun: 10,
    lookbackHours: 48,
    minRelevanceScore: 10,
    ...overrides,
  };
}

// =====================
// Tests
// =====================

describe('news-api-client scoring', () => {
  describe('scoreArticle - Core Terms', () => {
    it('scores high for open banking in title', () => {
      const article = createMockArticle({
        title: 'Open Banking Revolution Continues',
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      // 25 * 2 for title match = 50
      expect(score).toBeGreaterThanOrEqual(50);
    });

    it('scores lower for open banking in description only', () => {
      const article = createMockArticle({
        title: 'Banking News',
        description: 'Open banking initiatives are growing',
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      // 25 for description match
      expect(score).toBeGreaterThanOrEqual(25);
      expect(score).toBeLessThan(50);
    });

    it('scores high for PSD2 mentions', () => {
      const article = createMockArticle({
        title: 'PSD2 Implementation Progress',
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      // 20 * 2 for title = 40
      expect(score).toBeGreaterThanOrEqual(40);
    });

    it('scores for AISP and PISP terms', () => {
      const article = createMockArticle({
        description: 'New AISP and PISP regulations announced',
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      // 15 + 15 = 30
      expect(score).toBeGreaterThanOrEqual(30);
    });

    it('scores for account aggregation', () => {
      const article = createMockArticle({
        content: 'Account aggregation services expand',
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      expect(score).toBeGreaterThanOrEqual(18);
    });
  });

  describe('scoreArticle - Regulatory Terms', () => {
    it('adds bonus for CBUAE mentions', () => {
      const article = createMockArticle({
        title: 'Open Banking Update',
        description: 'CBUAE releases new guidelines',
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      // Should include CBUAE bonus (15)
      expect(score).toBeGreaterThanOrEqual(65); // 50 + 15
    });

    it('scores for banking license content', () => {
      const article = createMockArticle({
        content: 'New banking license requirements',
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      expect(score).toBeGreaterThanOrEqual(8);
    });
  });

  describe('scoreArticle - Regional Bonus', () => {
    it('adds bonus for UAE mentions', () => {
      const article = createMockArticle({
        title: 'Open Banking in UAE',
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      // 50 (open banking title) + 8 (UAE) = 58
      expect(score).toBeGreaterThanOrEqual(58);
    });

    it('adds bonus for Dubai mentions', () => {
      const article = createMockArticle({
        description: 'Dubai fintech sector',
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      expect(score).toBeGreaterThanOrEqual(6);
    });

    it('adds bonus for GCC mentions', () => {
      const article = createMockArticle({
        content: 'GCC banking cooperation',
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      expect(score).toBeGreaterThanOrEqual(5);
    });

    it('cumulates multiple regional bonuses', () => {
      const article = createMockArticle({
        title: 'UAE and Dubai Banking News',
        description: 'Abu Dhabi and Emirates fintech',
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      // UAE (8) + Dubai (6) + Abu Dhabi (6) + Emirates (5) = 25
      expect(score).toBeGreaterThanOrEqual(25);
    });
  });

  describe('scoreArticle - Preferred Sources', () => {
    it('adds bonus for preferred source', () => {
      const article = createMockArticle({
        source: { id: 'ft', name: 'Financial Times' },
      });
      const config = createMockConfig({
        preferredSources: ['Financial Times'],
      });

      const score = scoreArticle(article, config);

      expect(score).toBeGreaterThanOrEqual(10);
    });

    it('matches partial source names', () => {
      const article = createMockArticle({
        source: { id: 'reuters', name: 'Reuters UK' },
      });
      const config = createMockConfig({
        preferredSources: ['Reuters'],
      });

      const score = scoreArticle(article, config);

      expect(score).toBeGreaterThanOrEqual(10);
    });

    it('case insensitive source matching', () => {
      const article = createMockArticle({
        source: { id: 'ft', name: 'FINANCIAL TIMES' },
      });
      const config = createMockConfig({
        preferredSources: ['financial times'],
      });

      const score = scoreArticle(article, config);

      expect(score).toBeGreaterThanOrEqual(10);
    });
  });

  describe('scoreArticle - Recency Bonus', () => {
    it('adds highest bonus for articles less than 12 hours old', () => {
      const article = createMockArticle({
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      expect(score).toBeGreaterThanOrEqual(8);
    });

    it('adds medium bonus for articles 12-24 hours old', () => {
      const article = createMockArticle({
        publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      expect(score).toBeGreaterThanOrEqual(5);
      expect(score).toBeLessThan(8);
    });

    it('adds low bonus for articles 24-48 hours old', () => {
      const article = createMockArticle({
        publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36 hours ago
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      expect(score).toBeGreaterThanOrEqual(2);
      expect(score).toBeLessThan(5);
    });

    it('no bonus for articles older than 48 hours', () => {
      const article = createMockArticle({
        publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 72 hours ago
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      expect(score).toBeLessThan(2);
    });
  });

  describe('scoreArticle - Negative Signals', () => {
    it('reduces score for crypto content', () => {
      const baseArticle = createMockArticle({
        title: 'Open Banking News',
        description: '',
        content: '',
      });
      const cryptoArticle = createMockArticle({
        title: 'Open Banking News',
        description: 'crypto trading integration',
        content: '',
      });
      const config = createMockConfig();

      const baseScore = scoreArticle(baseArticle, config);
      const cryptoScore = scoreArticle(cryptoArticle, config);

      expect(cryptoScore).toBeLessThan(baseScore);
    });

    it('reduces score for bitcoin mentions', () => {
      const article = createMockArticle({
        title: 'Open Banking with Bitcoin',
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      // 50 (open banking) - 10 (bitcoin) = 40
      expect(score).toBeLessThanOrEqual(48); // accounting for recency
    });

    it('reduces score for NFT content', () => {
      const article = createMockArticle({
        description: 'NFT marketplace integration',
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      expect(score).toBeLessThan(10);
    });

    it('cumulates negative signals', () => {
      const article = createMockArticle({
        title: 'Open Banking for Crypto and NFT',
        description: 'Bitcoin and Web3 integration',
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      // Multiple negative terms should reduce score significantly
      // But score should never go below 0
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('never returns negative score', () => {
      const article = createMockArticle({
        title: 'Crypto Bitcoin Ethereum NFT Web3',
        description: 'metaverse defi blockchain trading',
        content: 'forex investment tips stock market',
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('scoreArticle - RSS Source Bonus', () => {
    it('adds RSS source bonus when provided', () => {
      const article = createMockArticle();
      const config = createMockConfig();

      const scoreWithoutBonus = scoreArticle(article, config);
      const scoreWithBonus = scoreArticle(article, config, { rssSourceBonus: 20 });

      expect(scoreWithBonus).toBe(scoreWithoutBonus + 20);
    });

    it('handles zero RSS bonus', () => {
      const article = createMockArticle();
      const config = createMockConfig();

      const scoreWithoutBonus = scoreArticle(article, config);
      const scoreWithZeroBonus = scoreArticle(article, config, { rssSourceBonus: 0 });

      expect(scoreWithZeroBonus).toBe(scoreWithoutBonus);
    });
  });

  describe('scoreArticle - Combined Scoring', () => {
    it('produces high score for highly relevant UAE open banking article', () => {
      const article = createMockArticle({
        source: { id: 'ft', name: 'Financial Times' },
        title: 'UAE Open Banking Framework Launch',
        description: 'CBUAE announces new open banking regulations for Dubai banks',
        content: 'The Central Bank of the UAE has released guidelines for AISP and PISP services',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      });
      const config = createMockConfig({
        preferredSources: ['Financial Times'],
      });

      const score = scoreArticle(article, config);

      // This should be a very high score
      expect(score).toBeGreaterThan(100);
    });

    it('produces low score for irrelevant article', () => {
      const article = createMockArticle({
        source: { id: 'random', name: 'Random Blog' },
        title: 'Sports News Today',
        description: 'Latest football scores',
        content: 'Match results from yesterday',
        publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 72 hours ago
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      expect(score).toBeLessThan(10);
    });

    it('handles null description and content gracefully', () => {
      const article = createMockArticle({
        title: 'Open Banking News',
        description: null,
        content: null,
      });
      const config = createMockConfig();

      // Should not throw and should still score the title
      const score = scoreArticle(article, config);

      expect(score).toBeGreaterThanOrEqual(50); // Title match
    });
  });

  describe('scoreArticle - Edge Cases', () => {
    it('handles empty title', () => {
      const article = createMockArticle({
        title: '',
        description: 'Open banking description',
      });
      const config = createMockConfig();

      const score = scoreArticle(article, config);

      expect(score).toBeGreaterThanOrEqual(25); // Description match only
    });

    it('handles empty config arrays', () => {
      const article = createMockArticle({
        title: 'Open Banking News',
      });
      const config = createMockConfig({
        preferredSources: [],
        keywords: [],
        excludeDomains: [],
      });

      const score = scoreArticle(article, config);

      // Should still score based on built-in terms
      expect(score).toBeGreaterThanOrEqual(50);
    });

    it('is case insensitive', () => {
      const lowerArticle = createMockArticle({
        title: 'open banking update',
      });
      const upperArticle = createMockArticle({
        title: 'OPEN BANKING UPDATE',
      });
      const config = createMockConfig();

      const lowerScore = scoreArticle(lowerArticle, config);
      const upperScore = scoreArticle(upperArticle, config);

      expect(lowerScore).toBe(upperScore);
    });
  });
});
