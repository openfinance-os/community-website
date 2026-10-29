import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NewsApiArticle } from '../../types/news-curation.js';
import {
  DEFAULT_SUMMARIZER_MODEL,
  processArticles,
  resolveSummarizerModel,
} from '../article-summarizer.js';

const article: NewsApiArticle = {
  source: { id: null, name: 'The National' },
  author: null,
  title: 'CBUAE confirms open finance go-live',
  description:
    'The Central Bank of the UAE said three banks have connected to the Nebras API Hub under Al Tareq, with 12000 consents in the first week.',
  url: 'https://www.thenationalnews.com/story?utm_source=rss&utm_medium=feed',
  urlToImage: null,
  publishedAt: '2026-10-28T08:00:00Z',
  content: null,
};

function jsonResponse(summary: string) {
  return {
    ok: true,
    json: async () => ({
      content: [
        { type: 'thinking', text: 'drafting' },
        { type: 'text', text: JSON.stringify({ summary, type: 'official', region: 'uae' }) },
      ],
    }),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('resolveSummarizerModel', () => {
  it('defaults to the current Haiku model and honours ANTHROPIC_MODEL', () => {
    expect(DEFAULT_SUMMARIZER_MODEL).toBe('claude-haiku-5-5');
    expect(resolveSummarizerModel()).toBe('claude-haiku-5-5');
    vi.stubEnv('ANTHROPIC_MODEL', 'claude-sonnet-5-5');
    expect(resolveSummarizerModel()).toBe('claude-sonnet-5-5');
    expect(resolveSummarizerModel('claude-haiku-5-5')).toBe('claude-haiku-5-5');
  });
});

describe('processArticles grounding', () => {
  it('asks the configured model for an original summary and keeps a grounded one', async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      expect(body.model).toBe('claude-haiku-5-5');
      expect(body.system).toContain('Do not copy');
      return jsonResponse(
        'Three banks have joined the Nebras API Hub. The Central Bank of the UAE reported 12000 consents during the first week of Al Tareq.'
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const curated = await processArticles(
      [article],
      new Map([[article.url, 88]]),
      { apiKey: 'test-key' },
      new Map([[article.url, 0.74]])
    );

    expect(curated).toHaveLength(1);
    expect(curated[0].confidence).toBe(0.74);
    expect(curated[0].sourceUrl).toBe('https://www.thenationalnews.com/story');
    expect(curated[0].summary).not.toBe(article.description);
  });

  it('drops a summary that copies the description or invents a figure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(article.description || ''))
    );
    const copied = await processArticles([article], new Map(), { apiKey: 'test-key' });
    expect(copied).toEqual([]);

    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse(
          'The Central Bank of the UAE said the Nebras API Hub signed 999 new participants under Al Tareq in the first week.'
        )
      )
    );
    const invented = await processArticles([article], new Map(), { apiKey: 'test-key' });
    expect(invented).toEqual([]);
  });

  it('does not publish the description when no model key is set', async () => {
    const curated = await processArticles([article], new Map(), {});
    expect(curated).toEqual([]);
  });
});
