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
  countryFilterSearch,
  countryFromSearch,
  countryMapDots,
  countryName,
  countryPagePath,
  describeCountryTrend,
  dotRadius,
  isNewsCountryCode,
  matchesNewsFilters,
  newsCountries,
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
    expect(countryName('HK')).toBe('Hong Kong');
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

  it('treats a list of codes as membership in each country', () => {
    expect(newsCountries(['AE', 'SA', 'AE', 'XX'])).toEqual(['AE', 'SA']);
    expect(newsCountries('EU')).toEqual(['EU']);
    expect(
      matchesNewsFilters(
        { type: 'official', region: 'global', country: ['AE', 'SA'] },
        { type: 'all', region: 'all', country: 'SA' }
      )
    ).toBe(true);
    expect(
      matchesNewsFilters(
        { type: 'official', region: 'global', country: ['AE', 'SA'] },
        { type: 'all', region: 'all', country: 'KW' }
      )
    ).toBe(false);
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

describe('country pages and the map trend', () => {
  const day = 24 * 60 * 60 * 1000;

  it('uses a lowercase path, including eu', () => {
    expect(countryPagePath('AE')).toBe('/news/country/ae/');
    expect(countryPagePath('EU')).toBe('/news/country/eu/');
  });

  it('counts a multi-country story once for each of its codes', () => {
    const counts = countCountriesInWindow(
      [
        { country: ['AE', 'SA'], date: now },
        { country: 'AE', date: new Date(now.getTime() - 10 * day) },
      ],
      now,
      90
    );
    expect(counts).toEqual([
      { code: 'AE', count: 2 },
      { code: 'SA', count: 1 },
    ]);
  });

  it('describes the top country against the previous window', () => {
    const items = [
      ...Array.from({ length: 15 }, () => ({ country: 'AE', date: now })),
      ...Array.from({ length: 9 }, () => ({
        country: 'AE',
        date: new Date(now.getTime() - 100 * day),
      })),
      { country: 'KW', date: now },
    ];
    expect(describeCountryTrend(items, now, 90)).toBe(
      '15 UAE stories in the last 90 days, up from 9 in the previous 90.'
    );
  });

  it('does not claim a rise when the previous window has no stories', () => {
    const text = describeCountryTrend([{ country: 'AE', date: now }], now, 90);
    expect(text).toBe('1 UAE story in the last 90 days. No UAE stories in the previous 90 days.');
    expect(text).not.toContain('up from');
  });

  it('states an all-time total without a comparison', () => {
    const text = describeCountryTrend(
      [
        { country: 'GB', date: new Date('2020-01-01T00:00:00.000Z') },
        { country: 'GB', date: now },
        { country: ['AE', 'GB'], date: now },
      ],
      now,
      'all'
    );
    expect(text).toBe('3 UK stories in total.');
  });

  it('says when the selected window has no tagged stories', () => {
    expect(
      describeCountryTrend([{ country: 'AE', date: new Date(now.getTime() - 40 * day) }], now, 30)
    ).toBe('No tagged stories in the last 30 days.');
  });
});

describe('country query parameter', () => {
  it('reads a shareable code and ignores unknown values', () => {
    expect(countryFromSearch('?country=EU')).toBe('EU');
    expect(countryFromSearch('?country=ae')).toBe('AE');
    expect(countryFromSearch('?country=%20kw')).toBe('KW');
    expect(countryFromSearch('?type=official&country=SA')).toBe('SA');
    expect(countryFromSearch('?country=ZZ')).toBeUndefined();
    expect(countryFromSearch('?country=USA')).toBeUndefined();
    expect(countryFromSearch('?country=')).toBeUndefined();
    expect(countryFromSearch('')).toBeUndefined();
  });

  it('writes and clears the country param without dropping the others', () => {
    expect(countryFilterSearch('', 'EU')).toBe('?country=EU');
    expect(countryFilterSearch('?country=AE', 'all')).toBe('');
    expect(countryFilterSearch('?country=eu', 'KW')).toBe('?country=KW');
    expect(countryFilterSearch('?view=map', 'EU')).toBe('?view=map&country=EU');
    expect(countryFilterSearch('?view=map&country=EU', 'all')).toBe('?view=map');
    expect(countryFilterSearch('?country=EU', 'ZZ')).toBe('?country=EU');
  });
});

describe('published news country tags', () => {
  const newsDir = join(process.cwd(), 'src/content/news');

  function countriesOf(file: string): string[] {
    const raw = readFileSync(join(newsDir, file), 'utf8');
    const frontmatter = raw.split(/^---$/m)[1] ?? '';
    const list = frontmatter.match(/^country:\s*\[([^\]]+)\]\s*$/m);
    if (list) return [...list[1].matchAll(/[A-Z]{2}/g)].map((match) => match[0]);
    const single = frontmatter.match(/^country:\s*"?([A-Z]{2})"?\s*$/m);
    return single ? [single[1]] : [];
  }

  it('tags single-country stories and lists every country a story names', () => {
    expect(
      countriesOf('2026-11-24-uk-fca-to-open-open-finance-engagement-early-in-the.md')
    ).toEqual(['GB']);
    expect(countriesOf('2026-11-11-cbk-issues-open-banking-regulatory-framework.md')).toEqual([
      'KW',
    ]);
    expect(countriesOf('2026-10-29-eu-council-adopts-first-reading-position-on-the-pa.md')).toEqual(
      ['EU']
    );
    expect(countriesOf('2026-11-04-european-commission-lists-fida-for-intended-withdr.md')).toEqual(
      ['EU']
    );
    expect(countriesOf('2026-11-20-canada-designates-fdx-as-technical-standards-body.md')).toEqual([
      'CA',
    ]);
    expect(countriesOf('2025-10-15-cbuae-joins-project-aperta.md')).toEqual([
      'AE',
      'BR',
      'GB',
      'HK',
    ]);
    expect(countriesOf('2026-11-12-saudi-open-banking-vs-uae-open-finance.md')).toEqual([
      'AE',
      'SA',
    ]);
    expect(
      countriesOf('2026-11-16-temu-adds-truelayer-pay-by-bank-at-checkout-in-europ.md')
    ).toEqual(['DE', 'EU']);
    expect(countriesOf('2026-11-16-weekly-digest.md')).toEqual([]);
    expect(countriesOf('2026-10-27-why-open-banking-needs-sustainable-commercial-mode.md')).toEqual(
      []
    );
  });

  it('counts a published multi-country story once for each of its countries', () => {
    const codes = countriesOf('2026-11-12-saudi-open-banking-vs-uae-open-finance.md');
    const counts = countCountriesInWindow([{ country: codes, date: now }], now, 90);
    expect(counts).toEqual([
      { code: 'AE', count: 1 },
      { code: 'SA', count: 1 },
    ]);
  });

  it('gives every tagged country a centroid', () => {
    const files = readdirSync(newsDir).filter((file) => file.endsWith('.md'));
    expect(files.length).toBeGreaterThan(100);
    for (const file of files) {
      for (const country of countriesOf(file)) {
        expect(isNewsCountryCode(country), file).toBe(true);
        if (!isNewsCountryCode(country)) continue;
        expect(countryCentroid(country), `${file} ${country}`).toBeDefined();
      }
    }
  });
});
