/**
 * Ecosystem Watch — static endpoint.
 *
 * Serves the weekly UAE Open Finance ecosystem watch dashboard at
 * /observatory/watch/. The page is a self-contained HTML template
 * (tools/watch/watch.template.html) into which the latest weekly payload
 * (data/watch/payload.json) is injected at build time, replacing the
 * `__DATA__` placeholder.
 *
 * The payload, diff state, and history under data/watch/ are updated by the
 * weekly regulatory-watch job, which commits them to this repo; Cloudflare
 * Pages then rebuilds the site, so this page is always one `git push` behind
 * the latest run — no runtime data fetching, no client-side dependencies.
 *
 * History: this page previously lived on a standalone Cloudflare Pages
 * project (ecosystem-watcher.openfinance-os.org), which now redirects here.
 */
import { readFileSync } from 'node:fs';
import type { APIRoute } from 'astro';

const SITE = 'https://openfinance-os.org';
const PAGE_URL = `${SITE}/observatory/watch/`;

const HEAD_META = [
  '<link rel="icon" type="image/svg+xml" href="/favicon.svg">',
  '<meta name="description" content="An independent weekly monitor of the UAE Open Finance ecosystem (Al Tareq / Nebras): API & payment volumes, standards changes, and CBUAE release compliance by tier.">',
  '<meta property="og:title" content="UAE Open Finance — Ecosystem Watch">',
  '<meta property="og:description" content="Weekly monitor of the UAE Open Finance ecosystem: volumes, payments, standards changes, and tier compliance.">',
  '<meta property="og:type" content="website">',
  `<meta property="og:url" content="${PAGE_URL}">`,
  '<meta name="twitter:card" content="summary">',
  `<link rel="canonical" href="${PAGE_URL}">`,
].join('');

export const GET: APIRoute = () => {
  const template = readFileSync('tools/watch/watch.template.html', 'utf8');
  const payload = readFileSync('data/watch/payload.json', 'utf8');

  if (!template.includes('__DATA__')) {
    throw new Error('tools/watch/watch.template.html is missing the __DATA__ placeholder');
  }
  // Validate the payload parses before baking it into the page.
  JSON.parse(payload);

  const html = template
    .replace('__DATA__', () => payload)
    .replace('</title>', `</title>${HEAD_META}`);

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};
