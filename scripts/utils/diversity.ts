// Diversity rules for the daily digest.
//
// Ranking still decides which stories are worth reading. This step decides
// which of those stories can sit next to each other: one domain per run, a
// rolling weekly share cap, and reserved slots for independent international
// coverage when any such story clears the relevance gate.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { NewsApiArticle, NewsSourceConfig } from '../types/news-curation.js';
import { inferRegion, normalizeUrl } from './article-filters.js';
import { isIndependentDomain } from './source-credibility.js';

export const DOMAIN_SHARE_WINDOW_DAYS = 7;
export const MIN_HISTORY_FOR_SHARE_CAP = 3;

export const DEFAULT_PRESS_RELEASE_PATTERNS = [
  '/pressarticle/',
  '/press-release',
  '/press-releases/',
  'prnewswire.com',
  'businesswire.com',
  'globenewswire.com',
  'einpresswire.com',
  'openpr.com',
];

const AGGREGATOR_HOSTS = new Set(['news.google.com', 'news.yahoo.com']);

export interface DomainHistoryItem {
  domain: string;
  /** ISO date or timestamp the item was published or proposed. */
  at: string;
  url?: string;
}

export interface DiversityPick {
  articles: NewsApiArticle[];
  /** How many reserved international slots were filled. */
  reservedInternational: number;
  skipped: string[];
}

export function hostnameFromUrl(raw: string | null | undefined): string {
  if (!raw) return '';
  try {
    return new URL(raw).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function isAggregatorHost(host: string): boolean {
  return AGGREGATOR_HOSTS.has(host);
}

/**
 * Domain used for caps. Google News redirects stay on news.google.com until
 * the article URL can be recovered, so the publisher homepage from
 * `<source url>` is the domain that counts.
 */
export function articleDomain(article: { url: string; publisherUrl?: string | null }): string {
  const host = hostnameFromUrl(article.url);
  if (isAggregatorHost(host) && article.publisherUrl) {
    return hostnameFromUrl(article.publisherUrl) || host;
  }
  return host;
}

export function isPressReleaseUrl(
  url: string,
  patterns: readonly string[] = DEFAULT_PRESS_RELEASE_PATTERNS
): boolean {
  const haystack = url.toLowerCase();
  return patterns.some((pattern) => pattern.length > 0 && haystack.includes(pattern.toLowerCase()));
}

export function isIndependentOutlet(article: NewsApiArticle): boolean {
  return isIndependentDomain(articleDomain(article));
}

export function mergeDomainHistory(items: DomainHistoryItem[]): DomainHistoryItem[] {
  const seen = new Set<string>();
  const merged: DomainHistoryItem[] = [];
  for (const item of items) {
    if (!item.domain) continue;
    const key = item.url ? normalizeUrl(item.url) : `${item.domain}|${item.at.slice(0, 10)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged;
}

function inWindow(at: string, now: Date): boolean {
  const time = new Date(at).getTime();
  if (Number.isNaN(time)) return false;
  const age = now.getTime() - time;
  return age >= 0 && age <= DOMAIN_SHARE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

function frontmatterValue(block: string, key: string): string {
  const match = block.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!match) return '';
  return match[1].trim().replace(/^["']|["']$/g, '');
}

/** External news files in src/content/news. Own posts have no `source` and are skipped. */
export function loadPublishedDomainHistory(newsDir: string): DomainHistoryItem[] {
  if (!existsSync(newsDir)) return [];
  const items: DomainHistoryItem[] = [];
  for (const file of readdirSync(newsDir)) {
    if (!file.endsWith('.md')) continue;
    const raw = readFileSync(join(newsDir, file), 'utf-8');
    const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatter) continue;
    const block = frontmatter[1];
    const source = frontmatterValue(block, 'source');
    if (!source.startsWith('http')) continue;
    const date = frontmatterValue(block, 'date');
    const publisher = frontmatterValue(block, 'publisher');
    const domain = articleDomain({
      url: source,
      publisherUrl: publisher.startsWith('http') ? publisher : null,
    });
    if (!domain || isAggregatorHost(domain)) continue;
    items.push({ domain, at: date || new Date(0).toISOString(), url: source });
  }
  return items;
}

/**
 * Pick the digest from an already ranked, relevance-gated list.
 * Reserved international items are included even when they rank below the cut,
 * then the list is returned in original rank order.
 */
export function selectDiverseArticles(
  ranked: NewsApiArticle[],
  config: Pick<
    NewsSourceConfig,
    'maxArticlesPerRun' | 'maxPerDomainPerRun' | 'maxDomainShareWeekly' | 'minInternationalPerRun'
  >,
  history: DomainHistoryItem[] = [],
  now: Date = new Date()
): DiversityPick {
  const max = config.maxArticlesPerRun ?? 5;
  const perDomain = config.maxPerDomainPerRun ?? 1;
  const maxShare = config.maxDomainShareWeekly ?? 0.3;
  const minInternational = config.minInternationalPerRun ?? 0;
  const recent = mergeDomainHistory(history).filter((item) => inWindow(item.at, now));

  const selected: NewsApiArticle[] = [];
  const domainCounts = new Map<string, number>();
  const skipped: string[] = [];
  const chosen = new Set<NewsApiArticle>();

  const canTake = (article: NewsApiArticle): string | null => {
    const domain = articleDomain(article) || 'unknown';
    if ((domainCounts.get(domain) || 0) >= perDomain) return 'per-run cap';
    if (recent.length >= MIN_HISTORY_FOR_SHARE_CAP && maxShare > 0) {
      const prior = recent.filter((item) => item.domain === domain).length;
      const today = domainCounts.get(domain) || 0;
      const projected = (prior + today + 1) / (recent.length + selected.length + 1);
      if (projected > maxShare + 1e-9) return 'weekly share';
    }
    return null;
  };

  const take = (article: NewsApiArticle) => {
    const domain = articleDomain(article) || 'unknown';
    selected.push(article);
    chosen.add(article);
    domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
  };

  const consider = (article: NewsApiArticle, reserved: boolean): boolean => {
    if (chosen.has(article)) return false;
    const reason = canTake(article);
    if (reason) {
      const domain = articleDomain(article) || 'unknown';
      skipped.push(
        `${reserved ? 'reserved ' : ''}${reason}: ${domain} — ${article.title.slice(0, 80)}`
      );
      return false;
    }
    take(article);
    return true;
  };

  let reservedInternational = 0;
  if (minInternational > 0) {
    for (const article of ranked) {
      if (reservedInternational >= minInternational || selected.length >= max) break;
      if (inferRegion(article) !== 'global') continue;
      if (!isIndependentOutlet(article)) continue;
      if (consider(article, true)) reservedInternational += 1;
    }
  }

  for (const article of ranked) {
    if (selected.length >= max) break;
    consider(article, false);
  }

  const order = new Map(ranked.map((article, index) => [article, index]));
  selected.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
  return { articles: selected, reservedInternational, skipped };
}
