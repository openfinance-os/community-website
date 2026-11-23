import { readFileSync } from 'node:fs';
import { watchBriefing } from './watch-briefing';

/** Render the saved Watch payload without changing its chart/data contracts. */
export function renderWatchContent() {
  const template = readFileSync('tools/watch/watch.template.html', 'utf8');
  const payload = readFileSync('data/watch/payload.json', 'utf8');
  if (!template.includes('__DATA__')) throw new Error('Watch template is missing __DATA__');
  const briefing = watchBriefing(JSON.parse(payload));
  const esc = (text: string) =>
    text.replace(
      /[&<>"']/g,
      (char) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[char]!
    );
  const fallback = `<noscript><section class="watch-fallback"><h1>Saved Ecosystem Watch briefing</h1><p>Run ${esc(briefing.runDate)}; operational logs through ${esc(briefing.asOfData)}.</p>${briefing.items.map((item) => `<article><h2>${esc(item.area)}</h2><p>${esc(item.text)}</p></article>`).join('')}<p>Enable JavaScript for the full charts and source tables, or <a href="/observatory/briefing/">read the integrated briefing</a>.</p></section></noscript>`;
  // Prefix template selectors so generic card/table/heading rules cannot restyle
  // the site's shared header, search dialog or founder footer.
  const styles = template
    .match(/<style>([\s\S]*?)<\/style>/)![1]
    .replace(/([^{}]+)\{([^{}]*)\}/g, (_, selector: string, declarations: string) => {
      const clean = selector.replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (clean.startsWith('@')) return `${selector}{${declarations}}`;
      // The template palette is attached to the content wrapper. Its dark
      // variant follows the theme resolved by BaseLayout, including persistence.
      const prefixed = clean
        .split(',')
        .map((part) => {
          part = part.trim();
          if (part === ':root' || part === 'body' || part === 'html') return '.watch-page';
          if (part === '[data-theme="dark"]') return '[data-theme="dark"] .watch-page';
          return `.watch-page ${part}`;
        })
        .join(',');
      return `${prefixed}{${declarations}}`;
    });
  const html = template.replace('__DATA__', () => payload.replace(/</g, '\\u003c'));
  const body = html.match(/<body>([\s\S]*?)<\/body>/)![1];
  return { styles, body: fallback + body };
}
