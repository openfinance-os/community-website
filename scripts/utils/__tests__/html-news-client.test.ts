import { describe, expect, it } from 'vitest';
import { parseCbuaeHome, parseNebrasNews } from '../html-news-client.js';

const NEBRAS = `
<a href="https://example.com/open-finance-agents?utm_source=nebras&amp;utm_medium=news" target="_blank" class="ed-article ed-article--feature">
  <div class="ed-article__meta">
    <span class="ed-article__tag">News</span>
    <span class="ed-article__date">30 Sep 2026</span>
    <span class="ed-article__source">FWDstart</span>
  </div>
  <h3 class="ed-article__title">Open finance, AI agents and the price of being chosen</h3>
  <p class="ed-article__text">The UAE's Open Finance payment volumes rose from AED 19.8 million to AED 78.2 million.</p>
</a>`;

const CBUAE = `
<div class="card scale-card shadow-sm">
  <div class="card-body">
    <p class="text-dark-custom">Press Release</p>
    <h3 class="card-title h4">CBUAE Achieves a New Milestone in Financial Innovation Through Aperta</h3>
    <p class="text-navy-custom fs-small">17 June 2026</p>
    <a href="/en/news-and-publications/news-and-insights/press-release/cbuae-aperta-open-finance/">Download</a>
  </div>
</div>
<div class="card scale-card shadow-sm">
  <div class="card-body">
    <p class="text-dark-custom">Publication</p>
    <h3 class="card-title h4">Quarterly Economic Review - September 2026</h3>
    <p class="text-navy-custom fs-small">30 September 2026</p>
    <a href="/en/news-and-publications/publications/quarterly-economic-review/">Download</a>
  </div>
</div>`;

describe('HTML news parsers', () => {
  it('parses Nebras cards and strips tracking parameters', () => {
    const [article] = parseNebrasNews(NEBRAS);
    expect(article.title).toBe('Open finance, AI agents and the price of being chosen');
    expect(article.source).toBe('FWDstart');
    expect(article.pubDate).toBe('30 Sep 2026');
    expect(article.link).toBe('https://example.com/open-finance-agents');
    expect(article.description).toContain('AED 19.8 million');
  });

  it('parses CBUAE press releases and skips publications', () => {
    const articles = parseCbuaeHome(CBUAE, 'https://www.centralbank.ae/en');
    expect(articles).toHaveLength(1);
    expect(articles[0].title).toContain('Aperta');
    expect(articles[0].source).toBe('CBUAE');
    expect(articles[0].link).toBe(
      'https://www.centralbank.ae/en/news-and-publications/news-and-insights/press-release/cbuae-aperta-open-finance/'
    );
    expect(articles[0].description).toContain('Central Bank of the UAE');
    expect(articles[0].description).toContain('17 June 2026');
  });
});
