import { readFileSync } from 'node:fs';
import { watchBriefing } from './watch-briefing';
import { renderWatchSummary } from './watch-summary';

/** Render the saved Watch payload without changing its chart/data contracts. */
export function renderWatchContent() {
  const template = readFileSync('tools/watch/watch.template.html', 'utf8');
  const payload = readFileSync('data/watch/payload.json', 'utf8');
  if (!template.includes('__DATA__')) throw new Error('Watch template is missing __DATA__');
  const data = JSON.parse(payload) as {
    runDate?: string;
    asOfData?: string;
    checked?: { date?: string };
    links?: Record<string, string>;
  };
  const briefing = watchBriefing(data);
  const fallback = `<noscript>${renderWatchSummary({ ...data, summary: briefing.items })}</noscript>`;
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
