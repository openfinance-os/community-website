import { describe, expect, it } from 'vitest';
import { isOwnPost, newsOrigin } from '@lib/news-origin';

describe('newsOrigin', () => {
  it('treats a source URL as external coverage', () => {
    expect(
      newsOrigin({
        id: '2026-01-15-lean',
        data: { title: 'Lean and Ziina', source: 'https://fintechnews.ae/story' },
      })
    ).toBe('external');
    expect(isOwnPost('external')).toBe(false);
  });

  it('classifies weekly digests and other unsourced posts', () => {
    expect(
      newsOrigin({
        id: '2026-11-02-weekly-digest',
        data: { title: 'This week in UAE Open Finance — 26 Oct–2 Nov' },
      })
    ).toBe('digest');
    expect(
      newsOrigin({
        id: '2026-10-29-12-of-30-uae-open-finance-authorization-servers',
        data: { title: '12 of 30: Why most registrations do not publish a server' },
      })
    ).toBe('analysis');
    expect(isOwnPost('digest')).toBe(true);
    expect(isOwnPost('analysis')).toBe(true);
  });

  it('honours an explicit origin', () => {
    expect(
      newsOrigin({
        id: '2026-11-02-weekly-digest',
        data: { title: 'This week in UAE Open Finance', origin: 'analysis' },
      })
    ).toBe('analysis');
  });
});
