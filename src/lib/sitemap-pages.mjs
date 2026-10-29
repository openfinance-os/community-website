import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Pathname with a trailing slash, except `/` and files that have an extension. */
export function canonicalPathname(page) {
  const { pathname } = new URL(page);
  if (pathname === '/') return '/';
  if (/\.[a-z0-9]+$/i.test(pathname)) return pathname;
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

/**
 * HTML pages that should appear in the sitemap.
 * Drops the 404, the /news index (it 301s to /updates), extension endpoints,
 * the legacy /github path, and the noindex post-confirm newsletter welcome page.
 */
export function includeInSitemap(page) {
  const pathname = canonicalPathname(page);
  if (pathname.includes('/github')) return false;
  if (pathname === '/404/' || pathname === '/404.html') return false;
  if (pathname === '/news/' || pathname === '/news/index.html') return false;
  if (pathname === '/newsletter/welcome/' || pathname === '/newsletter/welcome/index.html') {
    return false;
  }
  if (pathname.endsWith('.json')) return false;
  return true;
}

/** Publication dates for news posts, keyed by canonical pathname. */
export function loadNewsLastModified(newsDir) {
  const dates = new Map();
  let files = [];
  try {
    files = readdirSync(newsDir);
  } catch {
    return dates;
  }
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const raw = readFileSync(join(newsDir, file), 'utf8');
    const match = raw.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m);
    if (!match) continue;
    dates.set(`/news/${file.slice(0, -3)}/`, match[1]);
  }
  return dates;
}
