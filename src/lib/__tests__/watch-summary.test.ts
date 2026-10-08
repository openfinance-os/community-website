import { describe, expect, it } from 'vitest';
import { Window } from 'happy-dom';
import { renderWatchSummary } from '../watch-summary';
import { GET } from '../../pages/observatory/watch/index.html';

describe('server-readable Watcher summary', () => {
  it('serves the actual dated summary and source links without executing scripts', async () => {
    const html = await (GET as () => Response)().text();
    const window = new Window({
      settings: {
        enableJavaScriptEvaluation: false,
        disableCSSFileLoading: true,
        disableJavaScriptFileLoading: true,
      },
    });
    window.document.write(html);
    window.document.querySelectorAll('script, style').forEach((node) => node.remove());
    const summary = window.document.getElementById('watch-summary')!;
    expect(summary.textContent).toContain('Data as of');
    expect(summary.textContent).toContain('The Nebras community documentation site now builds');
    expect(summary.querySelector('h1')?.textContent).toBe('Saved Ecosystem Watch briefing');
    expect(
      window.document
        .querySelector('nav[aria-label="Observatory"] a[aria-current="page"]')
        ?.getAttribute('href')
    ).toBe('/observatory/watch/');
    expect(summary.querySelectorAll('time[datetime]')).toHaveLength(3);
    expect(
      summary.querySelector('a[href="https://nebras-open-finance.com/metrics"]')
    ).not.toBeNull();
    expect(summary.textContent).toContain('does not prove an institution is not certified');
    expect(window.document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://openfinance-os.org/observatory/watch/'
    );
    await window.happyDOM.abort();
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
