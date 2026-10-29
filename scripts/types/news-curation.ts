// Types for News Curation Workflow

export interface NewsApiArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
}

export interface CuratedArticle {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  description: string;
  summary: string;
  relevanceScore: number;
  /** Gate confidence from 0 to 1. Items below the configured threshold are not proposed. */
  confidence: number;
  /** Set for the agentic-access beat. Omitted for other accepted stories. */
  beat?: string;
  type: 'global' | 'community' | 'milestone' | 'official' | 'opinion';
  region: 'uae' | 'mena' | 'global';
  slug: string;
}

export interface PendingArticle extends CuratedArticle {
  createdAt: string;
  expiresAt: string;
  prNumber?: number;
  prUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
}

export interface CurationResult {
  success: boolean;
  articles: CuratedArticle[];
  errors: string[];
  timestamp: string;
}

export interface SlackMessage {
  blocks: SlackBlock[];
}

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  elements?: SlackElement[];
  accessory?: {
    type: string;
    text?: {
      type: string;
      text: string;
      emoji?: boolean;
    };
    url?: string;
  };
}

export interface SlackElement {
  type: string;
  text?: string;
  url?: string;
}

export interface GitHubPR {
  number: number;
  url: string;
  title: string;
  branch: string;
}

/** A news page with stable HTML and no usable feed. */
export interface HtmlNewsPage {
  name: string;
  url: string;
  priority: number;
  category?: 'regulatory' | 'regional' | 'industry';
  format: 'nebras-news' | 'cbuae-home';
  /** Overrides the global lookback. Official pages publish less often than news wires. */
  lookbackHours?: number;
}

export interface RssFeedSource {
  name: string;
  url: string;
  priority: number; // 1 = highest priority, 2 = secondary
  category?: 'regulatory' | 'regional' | 'industry';
  /**
   * Feed format. `google-news` feeds (news.google.com/rss/search) carry the
   * publisher in a <source> element and append " - Publisher" to titles;
   * the client normalises both so scoring sees the real outlet.
   */
  format?: 'rss' | 'google-news';
}

/** Minimum score an article must reach, by inferred region. */
export interface RegionThresholds {
  uae?: number;
  mena?: number;
  global?: number;
}

export interface RssArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  content?: string;
  source: string;
  categories?: string[];
}

export interface KeyCompany {
  name: string;
  region: 'uae' | 'mena' | 'global';
  weight: number;
}

export interface RegulatoryBody {
  name: string;
  fullName: string;
  region: 'uae' | 'uk' | 'europe' | 'mena' | 'global';
  weight: number;
}

export interface NewsSourceConfig {
  keywords: string[];
  excludeDomains: string[];
  excludedKeywords?: string[];
  preferredSources: string[];
  rssFeeds?: RssFeedSource[];
  keyCompanies?: KeyCompany[];
  regulatoryBodies?: RegulatoryBody[];
  breakingNewsSignals?: string[];
  maxArticlesPerRun: number;
  lookbackHours: number;
  minRelevanceScore?: number;
  /** Per-region minimum scores; falls back to minRelevanceScore. */
  regionThresholds?: RegionThresholds;
  /**
   * When true, articles inferred as `global` must mention at least one core
   * open banking / open finance term to be considered at all.
   */
  requireCoreTermForGlobal?: boolean;
  /** Reject items published more than this many hours in the future (default 6). */
  futureToleranceHours?: number;
  /**
   * Minimum relevance-gate confidence (0–1). Defaults to 0.55, which a core
   * open-finance term in the title clears on its own.
   */
  minConfidence?: number;
  /** Overrides the gate's core-term list when non-empty. */
  relevanceCoreTerms?: string[];
  /** Overrides the gate's hard exclusions when non-empty. */
  relevanceExclusions?: string[];
  /** HTML news pages scraped when the publisher has no feed. */
  htmlPages?: HtmlNewsPage[];
  /** URL path fragments identifying event, webinar or gated-content pages. */
  eventUrlPatterns?: string[];
  /** Title/description phrases identifying event listings or promos. */
  eventTitlePatterns?: string[];
  breakingNewsBonus?: number;
  contentQualityWeight?: number;
  minDescriptionLength?: number;
  staleThresholdHours?: number;
}

export interface ContentQualityScore {
  descriptionLength: number;
  hasAuthor: boolean;
  isPromotional: boolean;
  hasNumbers: boolean;
  hasQuotes: boolean;
  totalScore: number;
}

export interface ArticleScoreBreakdown {
  coreTerms: number;
  regulatory: number;
  relatedTerms: number;
  regional: number;
  companies: number;
  preferredSource: number;
  recency: number;
  rssBonus: number;
  breakingNews: number;
  contentQuality: number;
  penalties: number;
  total: number;
}
