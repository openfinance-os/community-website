import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { NewsApiArticle, NewsSourceConfig } from '../../types/news-curation.js';
import { rankArticles } from '../news-api-client.js';
import {
  assessRelevance,
  evaluateRelevanceGate,
  type LabelledNewsExample,
} from '../relevance-gate.js';

const examples = JSON.parse(
  readFileSync(new URL('./fixtures/news-pr-labels.json', import.meta.url), 'utf8')
) as LabelledNewsExample[];

const sources = JSON.parse(readFileSync('data/news-curation/sources.json', 'utf8')) as {
  minConfidence: number;
};

function article(overrides: Partial<NewsApiArticle> = {}): NewsApiArticle {
  return {
    source: { id: null, name: 'Finextra' },
    author: null,
    title: 'CBUAE brings open finance data sharing live',
    description:
      'The Central Bank of the UAE confirmed retail open finance data sharing under Al Tareq, with Nebras connecting the first banks.',
    url: 'https://example.com/of',
    urlToImage: null,
    publishedAt: '2026-10-28T09:00:00Z',
    content: null,
    ...overrides,
  };
}

const looseConfig: NewsSourceConfig = {
  keywords: [],
  excludeDomains: [],
  preferredSources: ['Finextra'],
  maxArticlesPerRun: 5,
  lookbackHours: 720,
  minRelevanceScore: 0,
  regionThresholds: { uae: 0, mena: 0, global: 0 },
  requireCoreTermForGlobal: false,
  minDescriptionLength: 20,
  minConfidence: sources.minConfidence,
};

describe('relevance gate on labelled news PRs', () => {
  const report = evaluateRelevanceGate(examples, { minConfidence: sources.minConfidence });

  it('uses the committed confidence threshold', () => {
    expect(sources.minConfidence).toBe(0.55);
  });

  it('raises precision on the last 72 bot news PRs', () => {
    // The previous pipeline proposed every labelled PR: 10 merged and 54 closed.
    expect(report.labelled).toBe(64);
    expect(report.before.truePositives).toBe(10);
    expect(report.before.falsePositives).toBe(54);
    expect(report.before.precision).toBeCloseTo(10 / 64, 5);

    expect(report.after.truePositives).toBe(8);
    expect(report.after.falsePositives).toBe(2);
    expect(report.after.falseNegatives).toBe(2);
    expect(report.after.precision).toBeCloseTo(0.8, 5);
    expect(report.after.recall).toBeCloseTo(0.8, 5);
    expect(report.after.precision).toBeGreaterThan(report.before.precision);

    expect(report.falsePositives.map((item) => item.number).sort()).toEqual([630, 676]);
    expect(report.falseNegatives.map((item) => item.number).sort()).toEqual([647, 668]);
  });

  it('keeps the merged AI-agent essays out because they are not about payments, APIs, or open finance', () => {
    for (const number of [647, 668]) {
      const example = examples.find((item) => item.number === number);
      expect(example).toBeTruthy();
      const decision = assessRelevance(
        article({
          title: example!.title,
          description: example!.summary,
          content: example!.summary,
        }),
        looseConfig
      );
      expect(decision.accept).toBe(false);
      expect(decision.reason).toBe('no-core-term');
    }
  });

  it('rejects the open off-topic items that previously reached review', () => {
    const messi = examples.find((item) => item.title.includes('Messi'));
    const qatar = examples.find((item) => item.title.includes('Asset Management'));
    expect(
      messi &&
        assessRelevance(article({ title: messi.title, description: messi.summary }), looseConfig)
          .accept
    ).toBe(false);
    expect(
      qatar &&
        assessRelevance(article({ title: qatar.title, description: qatar.summary }), looseConfig)
          .accept
    ).toBe(false);
    expect(report.openAccepted).toEqual([]);
    expect(report.openRejected).toHaveLength(8);
  });
});

describe('assessRelevance', () => {
  it('accepts a core term in the title and a UAE programme mention in the body', () => {
    const titleOnly = assessRelevance(
      article({
        title: 'Pay by Bank sector poised for growth says survey',
        description:
          'A survey of bill-pay behaviour finds growing interest in account-to-account checkout.',
      })
    );
    expect(titleOnly.accept).toBe(true);
    expect(titleOnly.confidence).toBeGreaterThanOrEqual(0.55);

    const bodyOnly = assessRelevance(
      article({
        title: 'TD and Akoya team up to modernise financial data sharing',
        description: 'Akoya, an open finance data access network, is connecting another US bank.',
      })
    );
    expect(bodyOnly.accept).toBe(false);
    expect(bodyOnly.reason).toBe('below-confidence');

    const bodyPlusProgramme = assessRelevance(
      article({
        title: 'Central bank confirms the next phase',
        description:
          'The Central Bank of the UAE said open finance data sharing will extend to insurance.',
      })
    );
    expect(bodyPlusProgramme.accept).toBe(true);
  });

  it('drops giveaways and asset-management items before they are ranked', () => {
    const messi = article({
      title: 'Mastercard and FAB Give UAE Cardholders a Chance to Win Messi Memorabilia',
      description:
        'Selected cardholders in the UAE played a game linked to Lionel Messi and could win memorabilia from the ambassador campaign running across the country.',
      url: 'https://fintechnews.ae/messi',
    });
    const ranked = rankArticles([article(), messi], looseConfig, 5, {
      now: new Date('2026-10-29T08:00:00Z'),
    });
    expect(ranked.map((item) => item.title)).toEqual([
      'CBUAE brings open finance data sharing live',
    ]);
    expect(assessRelevance(messi).reason).toBe('excluded-topic');
  });

  it('accepts UAE programme vocabulary and AI agents only with a payments or open-finance link', () => {
    expect(
      assessRelevance(
        article({
          title: 'Ozone Connect goes live on the API Hub',
          description:
            'Nebras has switched on Ozone Connect so licensed financial institutions can execute AlTareq payments through the hub.',
        })
      ).accept
    ).toBe(true);

    expect(
      assessRelevance(
        article({
          title: 'Banks deploy AI agents for pay-by-bank checkout',
          description:
            'The agents prepare a service initiation against the customer account and hand it to the API Hub.',
        })
      ).accept
    ).toBe(true);

    const software = assessRelevance(
      article({
        title: 'Backbase launches AI agents to speed up banking software delivery',
        description:
          'The vendor paired delivery teams with specialist AI agents for the software development lifecycle.',
      })
    );
    expect(software.accept).toBe(false);
    expect(software.reason).toBe('no-core-term');
  });
});
