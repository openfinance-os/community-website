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

export interface NewsSourceConfig {
  keywords: string[];
  excludeDomains: string[];
  preferredSources: string[];
  rssFeeds?: RssFeedSource[];
  maxArticlesPerRun: number;
  lookbackHours: number;
  minRelevanceScore?: number;
}
