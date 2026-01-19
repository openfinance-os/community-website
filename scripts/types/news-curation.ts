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

export interface RssFeedSource {
  name: string;
  url: string;
  priority: number; // 1 = highest priority, 2 = secondary
  category?: 'regulatory' | 'regional' | 'industry';
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
