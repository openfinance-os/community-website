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
import { watchBriefing } from '@lib/watch-briefing';
import { observatoryNavigation } from '@lib/observatory-navigation';

const SITE = 'https://openfinance-os.org';
const PAGE_URL = `${SITE}/observatory/watch/`;

const HEAD_META = [
  '<script src="/analytics/posthog.js"></script>',
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
  const briefing = watchBriefing(JSON.parse(payload));
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  const esc = (text: string) => text.replace(/[&<>"']/g, (char) => entities[char]);
  const navigation =
    '<nav aria-label="Observatory" style="display:flex;flex-wrap:wrap;gap:16px;padding:16px;max-width:1400px;margin:auto;font:14px system-ui">' +
    [{ key: 'home', href: '/', label: 'Home' }, ...observatoryNavigation]
      .map(
        ({ key, href, label }) =>
          `<a href="${href}"${key === 'watch' ? ' aria-current="page"' : ''}>${esc(label)}</a>`
      )
      .join('') +
    '</nav>';
  const fallback = `<noscript><section style="max-width:1200px;margin:auto;padding:16px"><h1>Saved Ecosystem Watch briefing</h1><p>Run ${esc(briefing.runDate)}; operational logs through ${esc(briefing.asOfData)}.</p>${briefing.items.map((item) => `<article><h2>${esc(item.area)}</h2><p>${esc(item.text)}</p></article>`).join('')}<p>Enable JavaScript for the full charts and source tables, or <a href="/observatory/briefing/">read the integrated briefing</a>.</p></section></noscript>`;

  const html = template
    .replace('__DATA__', () => payload.replace(/</g, '\\u003c'))
    .replace('<body>', `<body>${navigation}<main id="main-content">${fallback}`)
    .replace('</body>', '</main></body>')
    .replace('</title>', `</title>${HEAD_META}`);

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};
