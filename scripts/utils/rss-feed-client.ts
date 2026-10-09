// RSS Feed Client for fetching open finance news from curated sources
import type {
  RssFeedSource,
  RssArticle,
  NewsSourceConfig,
  NewsApiArticle,
} from '../types/news-curation.js';
import { normalizeUrl } from './article-filters.js';

interface RssFetchOptions {
  config: NewsSourceConfig;
  lookbackHours?: number;
}

/**
 * Simple XML parser for RSS feeds
 * Extracts content between XML tags
 */
function extractTagContent(xml: string, tagName: string): string {
  // Handle CDATA sections
  const cdataPattern = new RegExp(
    `<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tagName}>`,
    'i'
  );
  const cdataMatch = xml.match(cdataPattern);
  if (cdataMatch) {
    return cdataMatch[1].trim();
  }

  // Regular tag content
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'i');
  const match = xml.match(pattern);
  return match ? decodeHtmlEntities(match[1].trim()) : '';
}

/**
 * Extract all occurrences of a tag
 */
function extractAllTags(xml: string, tagName: string): string[] {
  const results: string[] = [];
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'gi');
  let match;
  while ((match = pattern.exec(xml)) !== null) {
    results.push(decodeHtmlEntities(match[1].trim()));
  }
  return results;
}

/**
 * Decode common HTML entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
}

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Google News search feeds append " - Publisher" to every title and carry the
 * publisher in a <source> element. Return the clean title and the outlet name
 * so scoring can apply preferred-source bonuses to the real publisher.
 */
export function normalizeGoogleNewsItem(
  item: string,
  title: string,
  fallbackSource: string
): { title: string; source: string } {
  const sourceMatch = item.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
  const publisher = sourceMatch ? decodeHtmlEntities(sourceMatch[1].trim()) : '';

  // Only strip the suffix when the feed names the publisher and the title
  // actually ends with it; a dash inside a headline is left alone.
  let cleanTitle = title;
  const separator = title.lastIndexOf(' - ');
  if (publisher && separator > 0) {
    const suffix = title.slice(separator + 3).trim();
    if (suffix.toLowerCase() === publisher.toLowerCase()) {
      cleanTitle = title.slice(0, separator).trim();
    }
  }

  return { title: cleanTitle, source: publisher || fallbackSource };
}

/**
 * Parse RSS/Atom feed XML into articles
 */
export function parseFeed(
  xml: string,
  sourceName: string,
  format: RssFeedSource['format'] = 'rss'
): RssArticle[] {
  const articles: RssArticle[] = [];

  // Check if it's an Atom feed
  const isAtom = xml.includes('<feed') && xml.includes('xmlns="http://www.w3.org/2005/Atom"');

  if (isAtom) {
    // Parse Atom feed
    const entryPattern = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    let entryMatch;

    while ((entryMatch = entryPattern.exec(xml)) !== null) {
      const entry = entryMatch[1];

      // Get link (Atom uses <link href="..."/>)
      const linkMatch = entry.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);
      const link = linkMatch ? linkMatch[1] : '';

      // Get published date (Atom uses <published> or <updated>)
      let pubDate = extractTagContent(entry, 'published');
      if (!pubDate) {
        pubDate = extractTagContent(entry, 'updated');
      }

      // Get content (Atom uses <content> or <summary>)
      let content = extractTagContent(entry, 'content');
      const summary = extractTagContent(entry, 'summary');

      articles.push({
        title: extractTagContent(entry, 'title'),
        link,
        pubDate,
        description: stripHtml(summary || content || ''),
        content: stripHtml(content || summary || ''),
        source: sourceName,
        categories: extractAllTags(entry, 'category'),
      });
    }
  } else {
    // Parse RSS feed
    const itemPattern = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let itemMatch;

    while ((itemMatch = itemPattern.exec(xml)) !== null) {
      const item = itemMatch[1];

      // Get content from various possible tags
      let content = extractTagContent(item, 'content:encoded');
      if (!content) {
        content = extractTagContent(item, 'content');
      }

      const description = extractTagContent(item, 'description');

      let title = extractTagContent(item, 'title');
      let source = sourceName;
      if (format === 'google-news') {
        const normalized = normalizeGoogleNewsItem(item, title, sourceName);
        title = normalized.title;
        source = normalized.source;
      }

      articles.push({
        title,
        link: extractTagContent(item, 'link') || extractTagContent(item, 'guid'),
        pubDate: extractTagContent(item, 'pubDate') || extractTagContent(item, 'dc:date'),
        description: stripHtml(description || ''),
        content: stripHtml(content || description || ''),
        source,
        categories: extractAllTags(item, 'category'),
      });
    }
  }

  return articles;
}

/**
 * Fetch a single RSS feed with retry logic
 */
async function fetchFeed(feed: RssFeedSource, retries: number = 3): Promise<RssArticle[]> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(feed.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'OpenFinance-OS News Curator/1.0',
          Accept: 'application/rss+xml, application/xml, text/xml, application/atom+xml',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xml = await response.text();
      const articles = parseFeed(xml, feed.name, feed.format);

      return articles;
    } catch (error) {
      lastError = error as Error;

      if (attempt < retries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.warn(`  Failed to fetch ${feed.name}: ${lastError?.message}`);
  return [];
}

/**
 * Convert RSS article to NewsAPI article format for compatibility
 */
function rssToNewsApiFormat(rssArticle: RssArticle): NewsApiArticle {
  // Parse the date
  let publishedAt: string;
  try {
    const date = new Date(rssArticle.pubDate);
    publishedAt = isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  } catch {
    publishedAt = new Date().toISOString();
  }

  return {
    source: {
      id: null,
      name: rssArticle.source,
    },
    author: null,
    title: rssArticle.title,
    description: rssArticle.description || null,
    url: rssArticle.link,
    urlToImage: null,
    publishedAt,
    content: rssArticle.content || null,
  };
}

/**
 * Fetch all RSS feeds and return combined articles
 */
export async function fetchRssArticles(options: RssFetchOptions): Promise<NewsApiArticle[]> {
  const { config, lookbackHours } = options;
  const feeds = config.rssFeeds || [];

  if (feeds.length === 0) {
    console.log('No RSS feeds configured, skipping RSS fetch.');
    return [];
  }

  console.log(`Fetching from ${feeds.length} RSS feeds...`);

  const allArticles: RssArticle[] = [];
  const seenUrls = new Set<string>();

  // Calculate cutoff date
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - (lookbackHours || config.lookbackHours));

  // Sort feeds by priority (1 = highest)
  const sortedFeeds = [...feeds].sort((a, b) => a.priority - b.priority);

  // Fetch all feeds (with some parallelism)
  const batchSize = 3;
  for (let i = 0; i < sortedFeeds.length; i += batchSize) {
    const batch = sortedFeeds.slice(i, i + batchSize);
    const results = await Promise.all(batch.map((feed) => fetchFeed(feed)));

    for (let j = 0; j < batch.length; j++) {
      const articles = results[j];
      const feed = batch[j];

      let addedCount = 0;
      for (const article of articles) {
        // Skip articles without required fields
        if (!article.title || !article.link) continue;

        // Skip duplicates (ignoring tracking parameters such as utm_*)
        const canonical = normalizeUrl(article.link);
        if (seenUrls.has(canonical)) continue;
        seenUrls.add(canonical);

        // Skip old articles
        try {
          const articleDate = new Date(article.pubDate);
          if (!isNaN(articleDate.getTime()) && articleDate < cutoffDate) {
            continue;
          }
        } catch {
          // If we can't parse the date, include the article
        }

        allArticles.push(article);
        addedCount++;
      }

      console.log(`  ${feed.name}: ${addedCount} articles`);
    }
  }

  console.log(`\nTotal unique RSS articles: ${allArticles.length}`);

  // Convert to NewsAPI format for compatibility with existing scoring/ranking
  return allArticles.map(rssToNewsApiFormat);
}

/**
 * Score RSS articles using the same logic as NewsAPI articles
 * RSS feeds from priority sources get a bonus
 */
export function getRssSourceBonus(sourceName: string, feeds: RssFeedSource[]): number {
  const feed = feeds.find((f) => f.name === sourceName);
  if (!feed) return 0;

  // Google News search feeds are keyword queries, not editorial picks, so
  // they get the smaller bonus regardless of priority.
  if (feed.format === 'google-news') return 5;

  // Priority 1 sources get +15 bonus, priority 2 get +8
  return feed.priority === 1 ? 15 : 8;
}
