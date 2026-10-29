import { describe, expect, it } from 'vitest';
import { isCopiedSummary, reviewSummary } from '../summary-grounding.js';

const source = {
  title: 'CBUAE confirms open finance go-live',
  description:
    'The Central Bank of the UAE said three banks have connected to the Nebras API Hub under Al Tareq, with 12000 consents in the first week.',
  content: null,
};

describe('reviewSummary', () => {
  it('rejects a summary that copies the description', () => {
    expect(isCopiedSummary(source.description, source.description)).toBe(true);
    const review = reviewSummary(source.description, source);
    expect(review.ok).toBe(false);
    expect(review.reasons).toContain('copied-description');
  });

  it('rejects numbers and names that are not in the source', () => {
    const review = reviewSummary(
      'The Central Bank of the UAE raised AED 999 million and named Lionel Messi as the face of the Nebras API Hub campaign under Al Tareq.',
      source
    );
    expect(review.ok).toBe(false);
    expect(review.reasons.some((reason) => reason.startsWith('number:999'))).toBe(true);
    expect(review.reasons.some((reason) => reason.includes('Messi'))).toBe(true);
  });

  it('accepts an original summary whose claims are in the source', () => {
    const review = reviewSummary(
      'Three banks have joined the Nebras API Hub. The Central Bank of the UAE reported 12000 consents during the first week of Al Tareq.',
      source
    );
    expect(review.reasons).toEqual([]);
    expect(review.ok).toBe(true);
  });

  it('accepts the AlTareq and TPP short forms when the source used the long form', () => {
    const review = reviewSummary(
      'Three banks have joined the Nebras API Hub under Al Tareq. The Central Bank of the UAE reported 12000 consents, and each TPP authenticates the PSU at the LFI.',
      {
        ...source,
        description:
          'The Central Bank of the UAE said three banks have connected to the Nebras API Hub under Altareq, with 12000 consents in the first week. Each third-party provider authenticates the payment service user at the licensed financial institution.',
      }
    );
    expect(review.reasons).toEqual([]);
    expect(review.ok).toBe(true);
  });

  it('treats 12,000 and 12000 as the same figure', () => {
    const review = reviewSummary(
      'Three banks have joined the Nebras API Hub. The Central Bank of the UAE reported 12,000 consents during the first week of Al Tareq.',
      source
    );
    expect(review.ok).toBe(true);
  });
});
