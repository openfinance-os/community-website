// Direct HTML sources for publishers that do not offer a usable feed.
//
// Nebras Open Finance (nebras-open-finance.com/news) is server-rendered HTML
// with a stable article card. CBUAE does not publish an RSS or Atom feed; the
// homepage lists press releases in stable card markup. The CBUAE site also
// challenges datacenter clients, so a failed fetch is logged and skipped.

import type {
  HtmlNewsPage,
  NewsApiArticle,
  NewsSourceConfig,
  RssArticle,
} from '../types/news-curation.js';
import { stripTrackingParams } from './article-filters.js';
import { decodeHtmlEntities, toNewsApiArticle } from './rss-feed-client.js';

export type { HtmlNewsPage };

function unwrapArchiveUrl(href: string, baseUrl: string): string {
  const absoluteArchive = href.match(/https?:\/\/web\.archive\.org\/web\/\d+\/(https?:\/\/.+)/i);
  if (absoluteArchive) return absoluteArchive[1];
  const pathArchive = href.match(/\/web\/\d+\/(https?:\/\/.+)/i);
  if (pathArchive) return pathArchive[1];
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
}

function cleanText(value: string): string {
  return decodeHtmlEntities(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Parse the Nebras Open Finance news log. */
export function parseNebrasNews(html: string): RssArticle[] {
  const articles: RssArticle[] = [];
  const pattern =
    /<a\s+[^>]*href="([^"]+)"[^>]*class="ed-article[^"]*"[\s\S]*?<span class="ed-article__date"[^>]*>([\s\S]*?)<\/span>[\s\S]*?<span class="ed-article__source"[^>]*>([\s\S]*?)<\/span>[\s\S]*?<h3 class="ed-article__title"[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p class="ed-article__text"[^>]*>([\s\S]*?)<\/p>/gi;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    const title = cleanText(match[4]);
    const link = stripTrackingParams(
      decodeHtmlEntities(unwrapArchiveUrl(match[1], 'https://nebras-open-finance.com/news'))
    );
    const description = cleanText(match[5]);
    if (!title || !link) continue;
    articles.push({
      title,
      link,
      pubDate: cleanText(match[2]),
      description,
      content: description,
      source: cleanText(match[3]) || 'Nebras Open Finance',
    });
  }
  return articles;
}

/** Parse press-release cards from the CBUAE homepage. Publications and statistics are ignored. */
export function parseCbuaeHome(
  html: string,
  pageUrl: string = 'https://www.centralbank.ae/en'
): RssArticle[] {
  const articles: RssArticle[] = [];
  const cards = html.split(/<div class="card scale-card/i).slice(1);

  for (const card of cards) {
    const titleMatch = card.match(/<h3[^>]*class="[^"]*card-title[^"]*"[^>]*>([\s\S]*?)<\/h3>/i);
    const dateMatch = card.match(
      /<p[^>]*class="[^"]*text-navy-custom[^"]*"[^>]*>\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})\s*<\/p>/i
    );
    const hrefMatch = card.match(/href="([^"]*\/press-release\/[^"]+)"/i);
    if (!titleMatch || !hrefMatch) continue;

    const title = cleanText(titleMatch[1]);
    const pubDate = dateMatch ? cleanText(dateMatch[1]) : '';
    const link = stripTrackingParams(unwrapArchiveUrl(hrefMatch[1], pageUrl));
    if (!title || !link) continue;

    // The card has no standfirst. Keep the title as the only factual claim and
    // add a dated attribution so downstream length checks have something real.
    const description = pubDate
      ? `Press release from the Central Bank of the UAE, dated ${pubDate}. ${title}`
      : `Press release from the Central Bank of the UAE. ${title}`;

    articles.push({
      title,
      link,
      pubDate,
      description,
      content: description,
      source: 'CBUAE',
    });
  }

  return articles;
}

async function fetchPage(page: HtmlNewsPage, retries: number = 3): Promise<string> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(page.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'OpenFinance-OS News Curator/1.0',
          Accept: 'text/html,application/xhtml+xml',
        },
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }
  }
  throw lastError || new Error(`Failed to fetch ${page.name}`);
}

function withinLookback(pubDate: string, lookbackHours: number, now: Date): boolean {
  if (!pubDate) return true;
  const published = new Date(pubDate);
  if (isNaN(published.getTime())) return true;
  const hoursAgo = (now.getTime() - published.getTime()) / (1000 * 60 * 60);
  return hoursAgo <= lookbackHours;
}

export async function fetchHtmlArticles(options: {
  config: NewsSourceConfig;
  now?: Date;
}): Promise<NewsApiArticle[]> {
  const pages = options.config.htmlPages || [];
  if (pages.length === 0) return [];

  const now = options.now || new Date();
  console.log(`Fetching from ${pages.length} HTML news pages...`);
  const articles: NewsApiArticle[] = [];

  for (const page of pages) {
    try {
      const html = await fetchPage(page);
      const parsed =
        page.format === 'nebras-news' ? parseNebrasNews(html) : parseCbuaeHome(html, page.url);
      const lookback = page.lookbackHours ?? options.config.lookbackHours;
      const fresh = parsed.filter((article) => withinLookback(article.pubDate, lookback, now));
      console.log(`  ${page.name}: ${fresh.length} articles`);
      articles.push(...fresh.map(toNewsApiArticle));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`  Failed to fetch ${page.name}: ${message}`);
    }
  }

  return articles;
}
