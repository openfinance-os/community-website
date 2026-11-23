import { describe, expect, it } from 'vitest';
import payload from '../../../data/watch/payload.json';
import { renderWatchContent } from '../watch-document';
import { renderWatchSummary } from '../watch-summary';
import { watchBriefing } from '../watch-briefing';

describe('server-readable Watch summary', () => {
  it('keeps the dated summary and source links in the no-JavaScript fallback', () => {
    const html = renderWatchContent().body;
    const briefing = watchBriefing(payload);
    expect(html.startsWith('<noscript>')).toBe(true);
    expect(html).toContain('Saved Ecosystem Watch briefing');
    expect(html).toContain('Data as of');
    expect(html).toContain(briefing.items[0].text);
    expect(html).toContain('href="https://nebras-open-finance.com/metrics"');
    expect(html).toContain('does not prove an institution is not certified');
    expect(html).toContain(`datetime="${payload.runDate}"`);
    expect(html).toContain(`datetime="${payload.asOfData}"`);
    expect(html).toContain(`datetime="${payload.checked.date}"`);
  });

  it('names the official documentation site when a saved summary refers to the website', () => {
    const briefing = watchBriefing({
      runDate: '2026-10-05',
      asOfData: '2026-09-29',
      summary: [
        { area: 'Standards', text: 'The website now builds from a draft specification branch.' },
      ],
    });
    const html = renderWatchSummary({ summary: briefing.items });
    expect(html).toContain(
      'The Nebras community documentation site now builds from a draft specification branch.'
    );
  });

  it('escapes summary content and rejects unsafe source links', () => {
    const html = renderWatchSummary({
      runDate: '2026-10-05',
      asOfData: '2026-09-29',
      summary: [{ area: '<img onerror=alert(1)>', text: '</script><script>bad()</script>' }],
      links: { standards: 'javascript:alert(1)', errata: 'https://user:password@example.com/' },
    });
    expect(html).toContain('&lt;script&gt;bad()&lt;/script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('password');
  });

  it('makes missing dates and summaries explicit', () => {
    const html = renderWatchSummary({ runDate: '<invalid>' });
    expect(html).toContain('Not recorded');
    expect(html).toContain('No summary recorded for this run.');
  });

  it('does not render impossible calendar dates as evidence dates', () => {
    const html = renderWatchSummary({ runDate: '2026-02-31', checked: { date: '2026-13-01' } });
    expect(html).not.toContain('<time');
    expect(html).toContain('Not recorded');
  });
});
