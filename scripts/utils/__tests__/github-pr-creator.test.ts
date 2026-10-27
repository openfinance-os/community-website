import { describe, it, expect } from 'vitest';
import type { CuratedArticle } from '../../types/news-curation.js';
import { generateMarkdownContent } from '../github-pr-creator.js';

const base = {
  title: 'Open Finance Is Restructuring the Global Financial System',
  publishedAt: '2026-10-26T10:00:00Z',
  type: 'global',
  region: 'global',
  source: 'International Banker',
  sourceUrl: 'https://news.google.com/rss/articles/abc?oc=5',
} as unknown as CuratedArticle;

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
