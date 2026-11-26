import { describe, expect, it } from 'vitest';
import { WORLD_LAND_PATH } from '@lib/world-land-path';
import {
  cardMatchesCountry,
  countryCodes,
  countryName,
  dotRadius,
  isCountryCode,
  mapDots,
  newsCountryCounts,
  project,
  readCountryParam,
  storyLabel,
} from '@lib/news-country';

const NOW = new Date('2026-11-26T00:00:00.000Z');

describe('country codes', () => {
  it('accepts ISO alpha-2 codes and EU, and rejects guesses', () => {
    expect(isCountryCode('AE')).toBe(true);
    expect(isCountryCode('EU')).toBe(true);
    expect(isCountryCode('NO')).toBe(true);
    expect(isCountryCode('UK')).toBe(false);
    expect(isCountryCode('ae')).toBe(false);
    expect(isCountryCode('UAE')).toBe(false);
  });

  it('normalises a code or a list and drops duplicates', () => {
    expect(countryCodes('KW')).toEqual(['KW']);
    expect(countryCodes(['AE', 'SA', 'AE'])).toEqual(['AE', 'SA']);
    expect(countryCodes(['UK', 'GB'])).toEqual(['GB']);
    expect(countryCodes(undefined)).toEqual([]);
    expect(countryCodes(null)).toEqual([]);
    expect(countryCodes('')).toEqual([]);
  });

  it('names the European Union and falls back to the code', () => {
    expect(countryName('EU')).toBe('European Union');
    expect(countryName('AE')).toBe('United Arab Emirates');
    expect(countryName('ZZ')).toBe('ZZ');
  });
});

describe('newsCountryCounts', () => {
  it('counts items inside the 90-day window and skips untagged or older stories', () => {
    const counts = newsCountryCounts(
      [
        { date: new Date('2026-11-16T00:00:00.000Z'), country: 'BR' },
        { date: new Date('2026-11-12T00:00:00.000Z'), country: ['AE', 'SA'] },
        { date: new Date('2026-11-11T00:00:00.000Z'), country: 'AE' },
        { date: new Date('2026-08-28T00:00:00.000Z'), country: 'KW' },
        { date: new Date('2026-08-27T23:59:59.999Z'), country: 'OM' },
        { date: new Date('2026-11-20T00:00:00.000Z') },
        { date: new Date('2026-11-01T00:00:00.000Z'), country: null },
      ],
      NOW
    );

    expect(counts.map((item) => [item.code, item.count])).toEqual([
      ['AE', 2],
      ['BR', 1],
      ['KW', 1],
      ['SA', 1],
    ]);
    expect(counts.find((item) => item.code === 'AE')?.name).toBe('United Arab Emirates');
    expect(counts.find((item) => item.code === 'OM')).toBeUndefined();
  });

  it('keeps a code that has no centroid in the list without a point', () => {
    const counts = newsCountryCounts(
      [{ date: new Date('2026-11-01T00:00:00.000Z'), country: 'AD' }],
      NOW
    );
    expect(counts).toEqual([{ code: 'AD', name: 'AD', count: 1, longitude: null, latitude: null }]);
    expect(mapDots(counts)).toEqual([]);
  });
});

describe('map geometry', () => {
  it('projects the UAE centroid and sizes dots by count', () => {
    const point = project(53.8478, 23.4241);
    expect(point.x).toBeCloseTo(623.594, 2);
    expect(point.y).toBeCloseTo(177.536, 2);
    expect(dotRadius(1, 1)).toBe(8);
    expect(dotRadius(1, 9)).toBe(8);
    expect(dotRadius(9, 9)).toBe(16);
  });

  it('places the European Union at Brussels and labels it', () => {
    const [dot] = mapDots([
      {
        code: 'EU',
        name: 'European Union',
        count: 3,
        longitude: 4.3517,
        latitude: 50.8503,
      },
    ]);
    expect(dot.showName).toBe(true);
    expect(dot.label).toBe('European Union, 3 stories');
    expect(dot.left).toBeCloseTo(51.2088, 2);
    expect(dot.top).toBeCloseTo(21.7498, 2);
    expect(dot.placement).toBe('above');
    expect(dot.align).toBe('center');
    expect(storyLabel('Kuwait', 1)).toBe('Kuwait, 1 story');

    const [sweden, unitedStates, newZealand] = mapDots([
      {
        code: 'SE',
        name: 'Sweden',
        count: 1,
        longitude: 18.6435,
        latitude: 60.1282,
      },
      {
        code: 'US',
        name: 'United States',
        count: 2,
        longitude: -95.7129,
        latitude: 37.0902,
      },
      {
        code: 'NZ',
        name: 'New Zealand',
        count: 1,
        longitude: 174.886,
        latitude: -40.9006,
      },
    ]);
    expect(sweden.placement).toBe('below');
    expect(unitedStates.align).toBe('start');
    expect(newZealand.align).toBe('end');
    expect(newZealand.showName).toBe(false);
  });

  it('inlines a static land outline', () => {
    expect(WORLD_LAND_PATH.startsWith('M')).toBe(true);
    expect(WORLD_LAND_PATH).toContain('Z');
    expect(WORLD_LAND_PATH.length).toBeGreaterThan(1000);
    expect(WORLD_LAND_PATH).not.toContain('http');
  });
});

describe('country filter helpers', () => {
  it('matches one code in a multi-country card and ignores an empty filter', () => {
    expect(cardMatchesCountry('AE SA', 'SA')).toBe(true);
    expect(cardMatchesCountry('AE SA', 'KW')).toBe(false);
    expect(cardMatchesCountry(null, 'AE')).toBe(false);
    expect(cardMatchesCountry('AE', null)).toBe(true);
  });

  it('reads a shareable country query and rejects unknown codes', () => {
    expect(readCountryParam('?country=kw')).toBe('KW');
    expect(readCountryParam('?country=EU')).toBe('EU');
    expect(readCountryParam('?country=UK')).toBeNull();
    expect(readCountryParam('')).toBeNull();
  });
});
