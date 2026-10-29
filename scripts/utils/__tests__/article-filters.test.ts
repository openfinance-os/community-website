import { describe, it, expect } from 'vitest';
import type { NewsApiArticle, NewsSourceConfig } from '../../types/news-curation.js';
import {
  checkPublicationDate,
  inferRegion,
  isDuplicateTitle,
  isEventOrPromo,
  isExcludedDomain,
  normalizeUrl,
  preFilterArticle,
  stripTrackingParams,
  titleSlug,
} from '../article-filters.js';
import {
  hasCoreTerm,
  matchesTerm,
  rankArticles,
  scoreArticle,
  thresholdForRegion,
} from '../news-api-client.js';
import {
  cleanGoogleNewsDescription,
  normalizeGoogleNewsItem,
  parseFeed,
} from '../rss-feed-client.js';

const NOW = new Date('2026-09-12T12:00:00Z');

function article(overrides: Partial<NewsApiArticle> = {}): NewsApiArticle {
  return {
    source: { id: null, name: 'Finextra' },
    author: 'Jane Reporter',
    title: 'CBUAE brings open finance data sharing live for retail customers',
    description:
      'The Central Bank of the UAE has confirmed the first retail open finance data sharing journeys under the Al Tareq framework, with three banks and two TPPs in production. Figures show 12,000 consents in week one.',
    url: 'https://example.com/news/cbuae-open-finance-live?utm_source=rss',
    urlToImage: null,
    publishedAt: '2026-09-11T09:00:00Z',
    content: null,
    ...overrides,
  };
}

const baseConfig: NewsSourceConfig = {
  keywords: [],
  excludeDomains: ['youtube.com', 'linkedin.com'],
  preferredSources: ['Finextra', 'The National'],
  maxArticlesPerRun: 5,
  lookbackHours: 168,
  minRelevanceScore: 20,
  regionThresholds: { uae: 20, mena: 35, global: 60 },
  requireCoreTermForGlobal: true,
  minDescriptionLength: 50,
};

describe('stripTrackingParams', () => {
  it('drops utm parameters and keeps the rest of the URL', () => {
    expect(
      stripTrackingParams(
        'https://www.finextra.com/newsarticle/1/foo?utm_medium=rssfinextra&utm_source=finextrafeed&id=9'
      )
    ).toBe('https://www.finextra.com/newsarticle/1/foo?id=9');
  });
});

describe('normalizeUrl', () => {
  it('strips tracking parameters, fragments and trailing slashes', () => {
    expect(
      normalizeUrl('https://www.finextra.com/newsarticle/1/foo/?utm_medium=rss&utm_source=feed#top')
    ).toBe('https://finextra.com/newsarticle/1/foo');
  });

  it('keeps meaningful query parameters', () => {
    expect(normalizeUrl('https://example.com/a?id=42&utm_campaign=x')).toBe(
      'https://example.com/a?id=42'
    );
  });

  it('returns the trimmed input for unparseable URLs', () => {
    expect(normalizeUrl(' not a url ')).toBe('not a url');
  });
});

describe('titleSlug / isDuplicateTitle', () => {
  it('produces file-safe slugs capped at 50 characters', () => {
    const slug = titleSlug('Spare & Xsquare bring "Pay by Bank" to UAE business payments!!!');
    expect(slug).toBe('spare-xsquare-bring-pay-by-bank-to-uae-business-pa');
    expect(slug.length).toBeLessThanOrEqual(50);
  });

  it('detects an already published story regardless of the date prefix', () => {
    const existing = new Set(['2026-07-13-spare-and-xsquare-bring-pay-by-bank-to-uae-busines']);
    expect(
      isDuplicateTitle('Spare and Xsquare Bring Pay by Bank to UAE Business Payments', existing)
    ).toBe(true);
  });

  it('does not collapse distinct stories that share opening words', () => {
    const existing = new Set(['2026-09-03-how-ai-agents-help-fis-tackle-regulatory-change']);
    expect(isDuplicateTitle('How AI is reshaping Gulf payments', existing)).toBe(false);
    expect(isDuplicateTitle('How acquirers are commercialising fraud', existing)).toBe(false);
  });
});

describe('isEventOrPromo', () => {
  it('rejects event listing URLs such as Finextra event-info pages', () => {
    expect(
      isEventOrPromo(
        article({
          url: 'https://www.finextra.com/event-info/632/how-ai-agents-help-fis?utm_medium=rss',
        })
      )
    ).toBe('event-or-promo-url');
  });

  it('rejects webinar and whitepaper titles', () => {
    expect(isEventOrPromo(article({ title: 'Webinar: The future of consumer payments' }))).toBe(
      'event-or-promo-title'
    );
    expect(
      isEventOrPromo(article({ description: 'Download the report to learn how banks ...' }))
    ).toBe('event-or-promo-title');
  });

  it('keeps ordinary reporting', () => {
    expect(isEventOrPromo(article())).toBeNull();
  });

  it('honours patterns from config', () => {
    expect(
      isEventOrPromo(article({ url: 'https://example.com/promo/x' }), {
        eventUrlPatterns: ['/promo/'],
        eventTitlePatterns: [],
      })
    ).toBe('event-or-promo-url');
  });
});

describe('checkPublicationDate', () => {
  it('rejects future-dated items (event dates masquerading as publish dates)', () => {
    expect(
      checkPublicationDate(article({ publishedAt: '2026-11-03T09:00:00Z' }), baseConfig, NOW)
    ).toBe('future-dated');
  });

  it('tolerates small clock skew', () => {
    expect(
      checkPublicationDate(article({ publishedAt: '2026-09-12T14:00:00Z' }), baseConfig, NOW)
    ).toBeNull();
  });

  it('rejects items older than the lookback window', () => {
    expect(
      checkPublicationDate(article({ publishedAt: '2026-08-01T09:00:00Z' }), baseConfig, NOW)
    ).toBe('too-old');
  });
});

describe('isExcludedDomain', () => {
  it('matches the host and its subdomains only', () => {
    expect(
      isExcludedDomain(article({ url: 'https://www.youtube.com/watch?v=1' }), ['youtube.com'])
    ).toBe(true);
    expect(
      isExcludedDomain(article({ url: 'https://m.youtube.com/watch?v=1' }), ['youtube.com'])
    ).toBe(true);
    expect(isExcludedDomain(article({ url: 'https://notyoutube.com/x' }), ['youtube.com'])).toBe(
      false
    );
  });
});

describe('inferRegion', () => {
  it('classifies UAE, MENA and global stories', () => {
    expect(inferRegion(article())).toBe('uae');
    expect(inferRegion(article({ title: 'Nebras onboarding update', description: 'x' }))).toBe(
      'uae'
    );
    expect(
      inferRegion(article({ title: 'SAMA licenses new open banking provider', description: 'x' }))
    ).toBe('mena');
    expect(
      inferRegion(article({ title: 'FCA consults on VRP expansion', description: 'UK regulator' }))
    ).toBe('global');
  });
});

describe('preFilterArticle', () => {
  it('reports the first failing rule', () => {
    expect(
      preFilterArticle(article({ url: 'https://linkedin.com/posts/x' }), baseConfig, NOW)
    ).toEqual({
      keep: false,
      reason: 'excluded-domain',
    });
    expect(preFilterArticle(article(), baseConfig, NOW)).toEqual({ keep: true });
  });
});

describe('matchesTerm / hasCoreTerm', () => {
  it('matches short acronyms only as whole words', () => {
    expect(matchesTerm('the sca deadline looms', 'sca')).toBe(true);
    expect(matchesTerm('banks scale up fraud controls', 'sca')).toBe(false);
    expect(matchesTerm('vrp adoption grows', 'vrp')).toBe(true);
    expect(matchesTerm('escalate to the fdo team', 'fdo')).toBe(true);
  });

  it('recognises UAE-specific vocabulary as core', () => {
    expect(hasCoreTerm(article({ title: 'Nebras publishes Q3 volumes', description: '...' }))).toBe(
      true
    );
    expect(
      hasCoreTerm(
        article({
          title: 'How acquirers are commercialising fraud intelligence',
          description: 'Fraud teams at large acquirers are turning risk signals into products.',
        })
      )
    ).toBe(false);
  });
});

describe('scoreArticle', () => {
  it('caps the recency bonus for future-dated items', () => {
    const future = scoreArticle(article({ publishedAt: '2026-11-03T09:00:00Z' }), baseConfig, {
      now: NOW,
    });
    const recent = scoreArticle(article({ publishedAt: '2026-09-12T11:00:00Z' }), baseConfig, {
      now: NOW,
    });
    expect(future).toBeLessThanOrEqual(recent);
  });

  it('ranks a UAE open finance story above adjacent global fintech news', () => {
    const uae = scoreArticle(article(), baseConfig, { now: NOW });
    const global = scoreArticle(
      article({
        title: 'AI in payments: short-term gains, long-term transformation',
        description:
          'Payments leaders discuss how artificial intelligence changes fraud, onboarding and reconciliation across the payments lifecycle.',
      }),
      baseConfig,
      { now: NOW }
    );
    expect(uae).toBeGreaterThan(global);
  });
});

describe('thresholdForRegion', () => {
  it('uses region thresholds with a fallback to minRelevanceScore', () => {
    expect(thresholdForRegion('global', baseConfig)).toBe(60);
    expect(thresholdForRegion('uae', { ...baseConfig, regionThresholds: undefined })).toBe(20);
  });
});

describe('rankArticles', () => {
  it('drops events, future-dated items and off-topic global stories before ranking', () => {
    const candidates: NewsApiArticle[] = [
      article(),
      article({
        title: 'How AI agents help FIs tackle regulatory change',
        url: 'https://www.finextra.com/event-info/632/how-ai-agents-help-fis-tackle-regulatory-change',
        publishedAt: '2026-10-14T09:00:00Z',
        description:
          'How can FIs effectively integrate agents to create a more connected response to regulatory change? Open banking, open finance and PSD3 in focus.',
      }),
      article({
        title: 'How acquirers are commercialising fraud intelligence',
        url: 'https://example.com/fraud-intel',
        description:
          'Fraud teams at large acquirers are turning risk signals into products for merchants and issuers across Europe.',
      }),
    ];

    const ranked = rankArticles(candidates, baseConfig, 5, { now: NOW });
    expect(ranked.map((a) => a.title)).toEqual([
      'CBUAE brings open finance data sharing live for retail customers',
    ]);
  });
});

describe('Google News feed handling', () => {
  const xml = `<?xml version="1.0"?><rss version="2.0"><channel><title>"open finance" UAE - Google News</title>
<item><title>CBUAE confirms open finance go-live for insurance - The National</title>
<link>https://news.google.com/rss/articles/abc?oc=5</link>
<pubDate>Thu, 11 Sep 2026 07:30:00 GMT</pubDate>
<description>&lt;a href="https://x"&gt;CBUAE confirms open finance go-live for insurance&lt;/a&gt;&amp;nbsp;&amp;nbsp;The National</description>
<source url="https://www.thenationalnews.com">The National</source></item>
</channel></rss>`;

  it('drops descriptions that only repeat the headline and publisher', () => {
    const [item] = parseFeed(xml, 'Google News - Open Finance UAE', 'google-news');
    expect(item.description).toBe('');
    expect(item.content).toBe('');
  });

  it('keeps Google News descriptions that add real text', () => {
    expect(
      cleanGoogleNewsDescription(
        'CBUAE confirms go-live The National Insurers must connect by March',
        'CBUAE confirms go-live',
        'The National'
      )
    ).toBe('CBUAE confirms go-live The National Insurers must connect by March');
  });

  it('decodes double-encoded entities in plain RSS descriptions', () => {
    const [item] = parseFeed(xml, 'Some Feed');
    expect(item.description).not.toContain('&nbsp;');
    expect(item.description).toBe('CBUAE confirms open finance go-live for insurance The National');
  });

  it('uses the publisher as the source and strips the title suffix', () => {
    const [item] = parseFeed(xml, 'Google News - Open Finance UAE', 'google-news');
    expect(item.title).toBe('CBUAE confirms open finance go-live for insurance');
    expect(item.source).toBe('The National');
    expect(item.link).toBe('https://news.google.com/rss/articles/abc?oc=5');
  });

  it('leaves plain RSS titles untouched', () => {
    const [item] = parseFeed(xml, 'Some Feed');
    expect(item.title).toBe('CBUAE confirms open finance go-live for insurance - The National');
    expect(item.source).toBe('Some Feed');
  });

  it('keeps titles that merely contain a dash', () => {
    const result = normalizeGoogleNewsItem(
      '',
      'Pay-by-bank grows - but slowly says a long analysis piece',
      'Fallback'
    );
    expect(result.title).toBe('Pay-by-bank grows - but slowly says a long analysis piece');
    expect(result.source).toBe('Fallback');
  });
});
