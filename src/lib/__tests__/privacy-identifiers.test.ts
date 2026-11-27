import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { retiredCookieNames, retiredStorageKeys } from '../../scripts/enhanced-analytics';

describe('privacy notice: retired identifiers', () => {
  it('selects the old visitor keys and PostHog persistence, and keeps the theme', () => {
    expect(
      retiredStorageKeys([
        'theme',
        'ofos_visitor_id',
        'ofos_visit_count',
        'ofos_first_visit',
        'ofos_last_visit',
        'ph_phc_abc_posthog',
        'utm_params',
      ])
    ).toEqual([
      'ofos_visitor_id',
      'ofos_visit_count',
      'ofos_first_visit',
      'ofos_last_visit',
      'ph_phc_abc_posthog',
    ]);
  });

  it('finds the old PostHog cookie in a cookie header', () => {
    expect(retiredCookieNames('a=1; ph_phc_abc_posthog=%7B%7D; theme=dark')).toEqual([
      'ph_phc_abc_posthog',
    ]);
    expect(retiredCookieNames('')).toEqual([]);
  });

  it('no longer writes a persistent visitor ID', () => {
    const source = readFileSync('src/scripts/enhanced-analytics.ts', 'utf8');
    expect(source).not.toMatch(/localStorage\.setItem/);
  });
});

describe('privacy notice: page and links', () => {
  const page = readFileSync('src/pages/privacy.astro', 'utf8');

  it('names every service that receives visitor data', () => {
    for (const service of ['PostHog', 'Buttondown', 'Cloudflare', 'Google Fonts']) {
      expect(page).toContain(service);
    }
  });

  it('is linked from the footer and the newsletter page form', () => {
    expect(readFileSync('src/components/common/Footer.astro', 'utf8')).toContain(
      "href: '/privacy'"
    );
    expect(readFileSync('src/components/common/NewsletterSignup.astro', 'utf8')).toContain(
      'href="/privacy"'
    );
  });
});
