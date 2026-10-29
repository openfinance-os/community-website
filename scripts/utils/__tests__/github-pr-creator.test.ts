import { describe, it, expect } from 'vitest';
import type { CuratedArticle } from '../../types/news-curation.js';
import {
  generateDigestBody,
  generateMarkdownContent,
  slugsFromPullRequest,
} from '../github-pr-creator.js';

const base = {
  title: 'Open Finance Is Restructuring the Global Financial System',
  publishedAt: '2026-10-26T10:00:00Z',
  type: 'global',
  region: 'global',
  source: 'International Banker',
  sourceUrl: 'https://news.google.com/rss/articles/abc?oc=5',
} as unknown as CuratedArticle;

describe('generateMarkdownContent', () => {
  it('strips tracking parameters from the source link', () => {
    const md = generateMarkdownContent({
      ...base,
      summary: 'Zen.com expanded pay-by-bank acceptance through Mastercard Open Finance.',
      sourceUrl:
        'https://www.finextra.com/newsarticle/48659/zen?utm_medium=rssfinextra&utm_source=finextrafeed',
    });
    expect(md).toContain('source: https://www.finextra.com/newsarticle/48659/zen');
    expect(md).not.toContain('utm_');
  });
});

describe('generateDigestBody', () => {
  const article = {
    ...base,
    summary: 'Zen.com expanded pay-by-bank acceptance through Mastercard Open Finance.',
    slug: '2026-10-28-zencom',
    confidence: 0.86,
    relevanceScore: 90,
    source: 'Finextra',
    sourceUrl: 'https://www.finextra.com/newsarticle/48659/zen?utm_source=finextrafeed',
  } as unknown as CuratedArticle;

  it('lists confidence and source for each item and records slugs', () => {
    const body = generateDigestBody([article], '2026-10-29');
    expect(body).toContain('Daily news digest');
    expect(body).toContain('| 1 | 0.86 | GLOBAL | Finextra | — |');
    expect(body).toContain('**Confidence:** 0.86');
    expect(body).toContain('**Source:** Finextra');
    expect(body).toContain('https://www.finextra.com/newsarticle/48659/zen');
    expect(body).not.toContain('utm_');
    expect(body).toContain('<!-- news-slugs: 2026-10-28-zencom -->');
    expect(body).not.toContain('**Beat:**');
  });

  it('tags an agentic-access item with its beat', () => {
    const body = generateDigestBody(
      [
        {
          ...article,
          beat: 'Open Finance and agentic access to data and payments',
        },
      ],
      '2026-10-29'
    );
    expect(body).toContain('| Open Finance and agentic access to data and payments |');
    expect(body).toContain('**Beat:** Open Finance and agentic access to data and payments');
  });
});

describe('slugsFromPullRequest', () => {
  it('reads digest slugs and legacy per-article branches', () => {
    expect(
      slugsFromPullRequest(
        'news/digest-2026-10-29',
        '<!-- news-slugs: 2026-10-28-zencom, 2026-10-27-plaid -->'
      )
    ).toEqual(['2026-10-28-zencom', '2026-10-27-plaid']);
    expect(slugsFromPullRequest('news/2026-10-28-zencom', '')).toEqual(['2026-10-28-zencom']);
    expect(slugsFromPullRequest('chore/observatory', '')).toEqual([]);
  });
});

describe('generateMarkdownContent', () => {
  it('writes the summary as description and body', () => {
    const md = generateMarkdownContent({ ...base, summary: 'A real "summary" of the piece.' });
    expect(md).toContain('description: "A real \\"summary\\" of the piece."');
    expect(md.trim().endsWith('A real "summary" of the piece.')).toBe(true);
  });

  it.each(['', 'Read the full article for more details.', 'No summary available.'])(
    'omits the description for placeholder summary %j',
    (summary) => {
      const md = generateMarkdownContent({ ...base, summary });
      expect(md).not.toContain('description:');
      expect(md.trim().endsWith('---')).toBe(true);
    }
  );
});
