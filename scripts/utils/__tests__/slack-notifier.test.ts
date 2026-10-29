import { describe, expect, it } from 'vitest';
import type { CuratedArticle } from '../../types/news-curation.js';
import { buildDigestSlackMessage } from '../slack-notifier.js';

function article(title: string, source: string): CuratedArticle {
  return {
    id: '1',
    title,
    source,
    sourceUrl: 'https://example.com/a',
    publishedAt: '2026-10-28T00:00:00Z',
    description: '',
    summary: `${title} is the original summary of a grounded open finance story for the digest.`,
    relevanceScore: 80,
    confidence: 0.74,
    type: 'official',
    region: 'uae',
    slug: '2026-10-28-story',
  };
}

describe('buildDigestSlackMessage', () => {
  it('sends one message with a single review action', () => {
    const message = buildDigestSlackMessage({
      prUrl: 'https://github.com/openfinance-os/community-website/pull/800',
      prNumber: 800,
      date: '2026-10-29',
      articles: [
        article('Nebras publishes API Hub volumes', 'CBUAE'),
        article('Pay by bank expands', 'Finextra'),
      ],
    });
    const actions = message.blocks.filter(
      (block) => (block as { type: string }).type === 'actions'
    );
    expect(actions).toHaveLength(1);
    const text = JSON.stringify(message);
    expect(text).toContain('Review digest PR');
    expect(text).toContain('confidence 0.74');
    expect(text).toContain('Finextra');
    expect(text).toContain('CBUAE');
    expect(text.match(/pull\/800/g)).toHaveLength(1);
  });
});
