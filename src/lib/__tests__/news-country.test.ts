import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  NEWS_COUNTRY_CODES,
  NEWS_COUNTRY_WINDOW_MS,
  WORLD_MAP_HEIGHT,
  WORLD_MAP_WIDTH,
  countCountriesInWindow,
  countryCentroid,
  countryMapDots,
  countryName,
  dotRadius,
  isNewsCountryCode,
  matchesNewsFilters,
  projectEquirectangular,
} from '@lib/news-country';

const DAY = 24 * 60 * 60 * 1000;
const now = new Date('2026-11-26T12:00:00.000Z');

describe('news country codes', () => {
  it('accepts ISO alpha-2 codes and the EU institution value', () => {
    expect(NEWS_COUNTRY_CODES).toHaveLength(250);
    expect(isNewsCountryCode('AE')).toBe(true);
    expect(isNewsCountryCode('EU')).toBe(true);
    expect(isNewsCountryCode('GB')).toBe(true);
    expect(countryName('AE')).toBe('United Arab Emirates');
    expect(countryName('EU')).toBe('European Union');
    expect(countryName('XX')).toBe('XX');
  });

  it('rejects lowercase, unknown, and longer codes', () => {
    expect(isNewsCountryCode('ae')).toBe(false);
    expect(isNewsCountryCode('XX')).toBe(false);
    expect(isNewsCountryCode('USA')).toBe(false);
    expect(isNewsCountryCode('')).toBe(false);
  });
});

describe('country centroids', () => {
  it('places EU at Brussels and keeps the UK on its own centroid', () => {
    expect(countryCentroid('EU')).toEqual({ lon: 4.3517, lat: 50.8503 });
    const uk = countryCentroid('GB');
    const eu = countryCentroid('EU');
    expect(uk).toBeDefined();
    expect(eu).toBeDefined();
    expect(uk).not.toEqual(eu);
  });

  it('projects Brussels into the northern-Europe part of the map', () => {
    const point = projectEquirectangular(4.3517, 50.8503, WORLD_MAP_WIDTH, WORLD_MAP_HEIGHT);
    expect(point.x).toBeCloseTo(491.6, 1);
    expect(point.y).toBeCloseTo(100.0, 1);
    expect(point.x).toBeGreaterThan(0);
    expect(point.x).toBeLessThan(WORLD_MAP_WIDTH);
    expect(point.y).toBeGreaterThan(0);
    expect(point.y).toBeLessThan(WORLD_MAP_HEIGHT);

    const [dot] = countryMapDots([{ country: 'EU', date: now }], now);
    expect(dot).toMatchObject({
      code: 'EU',
      name: 'European Union',
      count: 1,
      x: point.x,
      y: point.y,
    });
  });
});

describe('countCountriesInWindow', () => {
  it('counts only tagged items dated within the last 90 days', () => {
    const counts = countCountriesInWindow(
      [
        { country: 'AE', date: new Date(now.getTime() - 1 * DAY) },
        { country: 'AE', date: new Date(now.getTime() - 10 * DAY) },
        { country: 'EU', date: new Date(now.getTime() - 20 * DAY) },
        { country: 'GB', date: new Date(now.getTime() - NEWS_COUNTRY_WINDOW_MS) },
        { country: 'KW', date: new Date(now.getTime() - NEWS_COUNTRY_WINDOW_MS - 1) },
        { country: 'BR', date: new Date(now.getTime() + DAY) },
        { date: new Date(now.getTime() - 2 * DAY) },
        { country: 'ae', date: new Date(now.getTime() - 2 * DAY) },
      ],
      now
    );

    expect(counts).toEqual([
      { code: 'AE', count: 2 },
      { code: 'EU', count: 1 },
      { code: 'GB', count: 1 },
    ]);
  });

  it('returns no countries when nothing in the window is tagged', () => {
    expect(
      countCountriesInWindow(
        [{ date: now }, { country: 'SA', date: new Date('2020-01-01T00:00:00.000Z') }],
        now
      )
    ).toEqual([]);
  });

  it('sizes dots from the largest count in the window', () => {
    expect(dotRadius(4, 4)).toBeGreaterThan(dotRadius(1, 4));
    expect(dotRadius(1, 1)).toBe(dotRadius(4, 4));
  });
});

describe('matchesNewsFilters', () => {
  const item = { type: 'official', region: 'mena', country: 'KW' as const };

  it('matches a country together with the active type and region', () => {
    expect(matchesNewsFilters(item, { type: 'official', region: 'mena', country: 'KW' })).toBe(
      true
    );
    expect(matchesNewsFilters(item, { type: 'opinion', region: 'mena', country: 'KW' })).toBe(
      false
    );
    expect(matchesNewsFilters(item, { type: 'official', region: 'uae', country: 'KW' })).toBe(
      false
    );
    expect(matchesNewsFilters(item, { type: 'all', region: 'all', country: 'AE' })).toBe(false);
  });

  it('keeps untagged items when no country is selected', () => {
    expect(
      matchesNewsFilters(
        { type: 'milestone', region: 'uae' },
        { type: 'all', region: 'all', country: 'all' }
      )
    ).toBe(true);
    expect(
      matchesNewsFilters(
        { type: 'milestone', region: 'uae' },
        { type: 'all', region: 'uae', country: 'AE' }
      )
    ).toBe(false);
  });
});

describe('published news country tags', () => {
  const newsDir = join(process.cwd(), 'src/content/news');

  function countryOf(file: string): string | undefined {
    const raw = readFileSync(join(newsDir, file), 'utf8');
    const match = raw.match(/^country:\s*([A-Z]{2})\s*$/m);
    return match?.[1];
  }

  it('tags clear single-country stories and leaves mixed ones blank', () => {
    expect(countryOf('2026-11-24-uk-fca-to-open-open-finance-engagement-early-in-the.md')).toBe(
      'GB'
    );
    expect(countryOf('2026-11-11-cbk-issues-open-banking-regulatory-framework.md')).toBe('KW');
    expect(countryOf('2026-10-29-eu-council-adopts-first-reading-position-on-the-pa.md')).toBe(
      'EU'
    );
    expect(countryOf('2026-11-04-european-commission-lists-fida-for-intended-withdr.md')).toBe(
      'EU'
    );
    expect(countryOf('2026-11-20-canada-designates-fdx-as-technical-standards-body.md')).toBe('CA');
    expect(countryOf('2025-10-15-cbuae-joins-project-aperta.md')).toBeUndefined();
    expect(countryOf('2026-11-16-weekly-digest.md')).toBeUndefined();
    expect(countryOf('2026-11-12-saudi-open-banking-vs-uae-open-finance.md')).toBeUndefined();
  });

  it('gives every tagged country a centroid', () => {
    const files = readdirSync(newsDir).filter((file) => file.endsWith('.md'));
    expect(files.length).toBeGreaterThan(100);
    for (const file of files) {
      const country = countryOf(file);
      if (!country) continue;
      expect(isNewsCountryCode(country), file).toBe(true);
      if (!isNewsCountryCode(country)) continue;
      expect(countryCentroid(country), file).toBeDefined();
    }
  });
});
