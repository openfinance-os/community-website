// Editorial filters for the news curation pipeline.
//
// These run before scoring and answer one question: "is this something the
// community would actually publish?" Webinar listings, whitepaper downloads,
// event pages and future-dated items are never news, however keyword-dense
// their descriptions are. Keeping them out here means the scorer only ranks
// candidates that are worth a human's review time.

import type { NewsApiArticle, NewsSourceConfig } from '../types/news-curation.js';

export type RejectionReason =
  | 'event-or-promo-url'
  | 'event-or-promo-title'
  | 'future-dated'
  | 'too-old'
  | 'excluded-domain'
  | 'off-topic-region'
  | 'no-core-term';

export interface FilterResult {
  keep: boolean;
  reason?: RejectionReason;
}

/** URL path fragments that identify event, webinar and gated-content pages. */
export const DEFAULT_EVENT_URL_PATTERNS = [
  '/event-info/',
  '/events/',
  '/event/',
  '/webinar',
  '/webinars/',
  '/whitepaper',
  '/white-paper',
  '/whitepapers/',
  '/research/',
  '/reports/',
  '/report/',
  '/ebook',
  '/e-book',
  '/podcast',
  '/podcasts/',
  '/register',
  '/registration',
  '/sponsored',
  '/partner-content',
  '/press-release',
  '/press-releases/',
  '/jobs/',
  '/careers/',
];

/** Title or description phrases that mark an event listing or promo. */
export const DEFAULT_EVENT_TITLE_PATTERNS = [
  'webinar',
  'register now',
  'register today',
  'join us',
  'join our',
  'save the date',
  'live event',
  'virtual event',
  'in-person event',
  'on-demand',
  'on demand',
  'watch now',
  'download the report',
  'download now',
  'download our',
  'whitepaper',
  'white paper',
  'ebook',
  'e-book',
  'roundtable',
  'fireside chat',
  'panel discussion',
  'keynote',
  'summit 20',
  'conference 20',
  'expo 20',
  'sponsored',
  'advertorial',
  'press release',
];

/** Tracking parameters that make otherwise identical URLs look different. */
const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'ref',
  'source',
  'cmpid',
  'ncid',
]);

/**
 * Remove tracking parameters and the fragment from a URL that will be published.
 * The host, path, and non-tracking query parameters are left as written.
 */
export function stripTrackingParams(rawUrl: string): string {
  try {
    const url = new URL(rawUrl.trim());
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING_PARAMS.has(key.toLowerCase())) {
        url.searchParams.delete(key);
      }
    }
    return url.toString();
  } catch {
    return rawUrl.trim();
  }
}

/**
 * Canonicalise a URL for de-duplication: lower-case host, strip tracking
 * query parameters, hash fragments and trailing slashes.
 */
export function normalizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl.trim());
    url.hash = '';
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING_PARAMS.has(key.toLowerCase())) {
        url.searchParams.delete(key);
      }
    }
    let result = url.toString();
    if (url.search === '' && result.endsWith('?')) result = result.slice(0, -1);
    if (result.endsWith('/')) result = result.slice(0, -1);
    return result;
  } catch {
    return rawUrl.trim();
  }
}

/** Slug used for content files and duplicate detection (no date prefix). */
export function titleSlug(title: string, maxLength: number = 50): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, maxLength)
    .replace(/-$/, '');
}

/** Strip the YYYY-MM-DD- prefix from a content slug, if present. */
export function stripDatePrefix(slug: string): string {
  return slug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

/**
 * True when `title` matches an already-published or already-proposed slug.
 *
 * Matching compares the title portion of each slug and treats one as a
 * duplicate when it equals, or is a prefix (at least 24 characters) of, the
 * other. This is stricter than the previous 20-character fuzzy match, which
 * collapsed distinct stories that merely opened with the same words.
 */
export function isDuplicateTitle(title: string, existingSlugs: Iterable<string>): boolean {
  const candidate = titleSlug(title);
  if (!candidate) return false;
  const minPrefix = 24;

  for (const existing of existingSlugs) {
    const existingTitle = stripDatePrefix(existing);
    if (!existingTitle) continue;
    if (existingTitle === candidate) return true;
    const shorter = existingTitle.length < candidate.length ? existingTitle : candidate;
    const longer = shorter === existingTitle ? candidate : existingTitle;
    if (shorter.length >= minPrefix && longer.startsWith(shorter)) return true;
  }
  return false;
}

/** Event, webinar, gated-content and promotional pages are not news. */
export function isEventOrPromo(
  article: NewsApiArticle,
  config: Pick<NewsSourceConfig, 'eventUrlPatterns' | 'eventTitlePatterns'> = {}
): RejectionReason | null {
  const urlPatterns = config.eventUrlPatterns || DEFAULT_EVENT_URL_PATTERNS;
  const titlePatterns = config.eventTitlePatterns || DEFAULT_EVENT_TITLE_PATTERNS;

  let path = '';
  try {
    const url = new URL(article.url);
    path = `${url.pathname}${url.search}`.toLowerCase();
  } catch {
    path = article.url.toLowerCase();
  }
  if (urlPatterns.some((pattern) => path.includes(pattern.toLowerCase()))) {
    return 'event-or-promo-url';
  }

  const title = article.title.toLowerCase();
  const description = (article.description || '').toLowerCase().slice(0, 300);
  const haystack = `${title} ${description}`;
  if (titlePatterns.some((pattern) => haystack.includes(pattern.toLowerCase()))) {
    return 'event-or-promo-title';
  }

  return null;
}

/**
 * Reject items whose publication date is in the future (event listings use
 * the event date) or older than the lookback window.
 */
export function checkPublicationDate(
  article: NewsApiArticle,
  config: Pick<NewsSourceConfig, 'lookbackHours' | 'futureToleranceHours'>,
  now: Date = new Date()
): RejectionReason | null {
  const published = new Date(article.publishedAt);
  if (isNaN(published.getTime())) return null; // unknown date: let scoring decide

  const hoursAhead = (published.getTime() - now.getTime()) / (1000 * 60 * 60);
  const tolerance = config.futureToleranceHours ?? 6;
  if (hoursAhead > tolerance) return 'future-dated';

  if (config.lookbackHours && -hoursAhead > config.lookbackHours) return 'too-old';

  return null;
}

/** True when the article's host is on the excluded-domain list. */
export function isExcludedDomain(article: NewsApiArticle, excludeDomains: string[]): boolean {
  let host = '';
  try {
    host = new URL(article.url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return false;
  }
  return excludeDomains.some((domain) => {
    const d = domain.toLowerCase().replace(/^www\./, '');
    return host === d || host.endsWith(`.${d}`);
  });
}

/**
 * Run every pre-scoring filter. Returns the first reason to reject, or
 * `{ keep: true }` when the article should be scored.
 */
export function preFilterArticle(
  article: NewsApiArticle,
  config: NewsSourceConfig,
  now: Date = new Date()
): FilterResult {
  if (isExcludedDomain(article, config.excludeDomains || [])) {
    return { keep: false, reason: 'excluded-domain' };
  }

  const dateReason = checkPublicationDate(article, config, now);
  if (dateReason) return { keep: false, reason: dateReason };

  const promoReason = isEventOrPromo(article, config);
  if (promoReason) return { keep: false, reason: promoReason };

  return { keep: true };
}

export type ArticleRegion = 'uae' | 'mena' | 'global';

const UAE_SIGNALS = [
  'uae',
  'u.a.e',
  'emirates',
  'dubai',
  'abu dhabi',
  'sharjah',
  'cbuae',
  'central bank of the uae',
  'difc',
  'adgm',
  'al tareq',
  'altareq',
  'nebras',
  'lean technologies',
  'tarabut',
];

const MENA_SIGNALS = [
  'saudi',
  'sama',
  'bahrain',
  'qatar',
  'kuwait',
  'oman',
  'egypt',
  'jordan',
  'lebanon',
  'gcc',
  'gulf',
  'middle east',
  'mena',
];

/** Cheap keyword-based region inference shared by scoring and summarising. */
export function inferRegion(
  article: Pick<NewsApiArticle, 'title' | 'description' | 'content'>
): ArticleRegion {
  const text =
    `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  if (UAE_SIGNALS.some((signal) => text.includes(signal))) return 'uae';
  if (MENA_SIGNALS.some((signal) => text.includes(signal))) return 'mena';
  return 'global';
}

/** Summarise rejection reasons for the run log. */
export function summarizeRejections(reasons: RejectionReason[]): string {
  const counts = new Map<RejectionReason, number>();
  for (const reason of reasons) counts.set(reason, (counts.get(reason) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => `${reason}=${count}`)
    .join(', ');
}
