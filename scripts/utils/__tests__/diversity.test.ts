import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { NewsApiArticle, NewsSourceConfig } from '../../types/news-curation.js';
import { scoreArticle } from '../news-api-client.js';
import { getSourceTier, getTierAdjustment } from '../source-credibility.js';
import {
  articleDomain,
  loadPublishedDomainHistory,
  selectDiverseArticles,
  type DomainHistoryItem,
} from '../diversity.js';

const sources = JSON.parse(
  readFileSync('data/news-curation/sources.json', 'utf8')
) as NewsSourceConfig;

function story(overrides: Partial<NewsApiArticle> = {}): NewsApiArticle {
  return {
    source: { id: null, name: 'Finextra' },
    author: null,
    title: 'CBUAE brings open finance data sharing live',
    description:
      'The Central Bank of the UAE confirmed retail open finance data sharing under Al Tareq, with enough detail to clear the description floor.',
    url: 'https://www.finextra.com/newsarticle/1/cbuae',
    urlToImage: null,
    publishedAt: '2026-11-02T09:00:00Z',
    content: null,
    ...overrides,
  };
}

const config: NewsSourceConfig = {
  ...sources,
  maxArticlesPerRun: 5,
  maxPerDomainPerRun: 1,
  maxDomainShareWeekly: 0.3,
  minInternationalPerRun: 2,
  pressReleasePenalty: 25,
};

const NOW = new Date('2026-11-03T12:00:00Z');

describe('source rebalance config', () => {
  it('caps domains, reserves international slots, and lowers the global threshold', () => {
    expect(sources.regionThresholds?.global).toBe(40);
    expect(sources.requireCoreTermForGlobal).toBe(true);
    expect(sources.maxPerDomainPerRun).toBe(1);
    expect(sources.maxDomainShareWeekly).toBe(0.3);
    expect(sources.minInternationalPerRun).toBe(2);
    expect(sources.preferredSources).not.toContain('Fintech News Middle East');
    const fintechNews = sources.rssFeeds?.find((feed) => feed.name === 'Fintech News Middle East');
    expect(fintechNews?.priority).toBe(2);
    expect(sources.rssFeeds?.find((feed) => feed.name === 'Bank Automation News')?.enabled).toBe(
      false
    );
    expect(
      sources.rssFeeds?.some((feed) => feed.url === 'https://www.openbankingexpo.com/feed/')
    ).toBe(true);
  });

  it('records fintechnews.ae as a house wire and Reuters as independent', () => {
    expect(getSourceTier('fintechnews.ae')).toBe('house');
    expect(getSourceTier('www.reuters.com')).toBe('independent');
    expect(getTierAdjustment('fintechnews.ae')).toBeLessThan(0);
    expect(getTierAdjustment('reuters.com')).toBeGreaterThan(0);
    expect(getTierAdjustment('example.com')).toBe(0);
  });
});

describe('selectDiverseArticles', () => {
  it('keeps one item per domain in rank order', () => {
    const ranked = [
      story({ title: 'First Finextra', url: 'https://www.finextra.com/newsarticle/1' }),
      story({ title: 'Second Finextra', url: 'https://www.finextra.com/newsarticle/2' }),
      story({
        title: 'Payments Dive on UAE open finance',
        url: 'https://www.paymentsdive.com/news/uae-open-finance',
        source: { id: null, name: 'Payments Dive' },
      }),
    ];
    const pick = selectDiverseArticles(ranked, { ...config, maxArticlesPerRun: 2 }, [], NOW);
    expect(pick.articles.map((item) => item.title)).toEqual([
      'First Finextra',
      'Payments Dive on UAE open finance',
    ]);
  });

  it('blocks a domain that already exceeds the weekly share', () => {
    const history: DomainHistoryItem[] = [
      ...Array.from({ length: 4 }, (_, index) => ({
        domain: 'fintechnews.ae',
        at: '2026-11-02T00:00:00Z',
        url: `https://fintechnews.ae/story-${index}`,
      })),
      ...['pymnts.com', 'wamda.com', 'ft.com', 'bloomberg.com', 'techcrunch.com', 'wired.com'].map(
        (domain, index) => ({
          domain,
          at: '2026-11-01T00:00:00Z',
          url: `https://${domain}/story-${index}`,
        })
      ),
    ];
    const ranked = [
      story({
        title: 'Another Fintech News story',
        url: 'https://fintechnews.ae/new',
        source: { id: null, name: 'Fintech News Middle East' },
      }),
      story({
        title: 'Reuters on the FCA open banking consultation',
        url: 'https://www.reuters.com/world/fca-open-banking',
        source: { id: null, name: 'Reuters' },
      }),
    ];
    const pick = selectDiverseArticles(ranked, config, history, NOW);
    expect(pick.articles.map((item) => articleDomain(item))).toEqual(['reuters.com']);
    expect(
      pick.skipped.some((line) => line.includes('weekly share') && line.includes('fintechnews.ae'))
    ).toBe(true);
  });

  it('ignores the weekly cap until three history items exist', () => {
    const history: DomainHistoryItem[] = [
      { domain: 'fintechnews.ae', at: '2026-11-02T00:00:00Z', url: 'https://fintechnews.ae/old' },
    ];
    const pick = selectDiverseArticles(
      [story({ url: 'https://fintechnews.ae/new', title: 'Still eligible' })],
      config,
      history,
      NOW
    );
    expect(pick.articles).toHaveLength(1);
  });

  it('reserves international slots from independent outlets without leaving gaps', () => {
    const uae = (domain: string, title: string) =>
      story({
        title,
        url: `https://${domain}/uae-open-finance`,
        source: { id: null, name: title },
        description: 'UAE open finance data sharing went live for retail customers under Al Tareq.',
      });
    const global = (domain: string, title: string) =>
      story({
        title,
        url: `https://${domain}/fca-open-banking`,
        source: { id: null, name: title },
        description:
          'The Financial Conduct Authority consulted on open banking and PSD3 for account-to-account payments.',
      });
    const ranked = [
      uae('fintechnews.ae', 'House wire one'),
      uae('pymnts.com', 'Trade two'),
      uae('wamda.com', 'Regional three'),
      uae('khaleejtimes.com', 'Regional four'),
      uae('gulfnews.com', 'Regional five'),
      global('reuters.com', 'Reuters on the FCA consultation'),
      global('finextra.com', 'Finextra on PSD3'),
    ];
    const pick = selectDiverseArticles(ranked, config, [], NOW);
    expect(pick.reservedInternational).toBe(2);
    expect(pick.articles).toHaveLength(5);
    expect(pick.articles.map((item) => articleDomain(item))).toEqual([
      'fintechnews.ae',
      'pymnts.com',
      'wamda.com',
      'reuters.com',
      'finextra.com',
    ]);

    const localOnly = selectDiverseArticles(ranked.slice(0, 5), config, [], NOW);
    expect(localOnly.reservedInternational).toBe(0);
    expect(localOnly.articles).toHaveLength(5);
  });
});

describe('press-release penalty', () => {
  it('scores a press-release URL below the same editorial story', () => {
    const editorial = scoreArticle(
      story({ url: 'https://www.finextra.com/newsarticle/1/open-banking' }),
      config,
      { now: NOW }
    );
    const press = scoreArticle(
      story({ url: 'https://www.finextra.com/pressarticle/1/open-banking' }),
      config,
      { now: NOW }
    );
    expect(editorial - press).toBe(25);
  });
});

describe('loadPublishedDomainHistory', () => {
  it('reads source domains and skips posts with no source', () => {
    const items = loadPublishedDomainHistory('src/content/news');
    expect(
      items.some((item) => item.domain === 'fintechnews.media' || item.domain === 'fintechnews.ae')
    ).toBe(true);
    expect(items.every((item) => item.domain !== 'openfinance-os.org')).toBe(true);
    expect(items.every((item) => item.url?.startsWith('http'))).toBe(true);
  });
});
