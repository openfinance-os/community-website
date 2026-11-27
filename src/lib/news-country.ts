/**
 * News country tags. ISO 3166-1 alpha-2, plus two exceptions that are not
 * official ISO codes: `EU` for EU-level institutions (Commission, Council,
 * Parliament, EBA), and `XK` for Kosovo.
 */

export const ISO_3166_1_ALPHA_2 = [
  'AD',
  'AE',
  'AF',
  'AG',
  'AI',
  'AL',
  'AM',
  'AO',
  'AQ',
  'AR',
  'AS',
  'AT',
  'AU',
  'AW',
  'AX',
  'AZ',
  'BA',
  'BB',
  'BD',
  'BE',
  'BF',
  'BG',
  'BH',
  'BI',
  'BJ',
  'BL',
  'BM',
  'BN',
  'BO',
  'BQ',
  'BR',
  'BS',
  'BT',
  'BV',
  'BW',
  'BY',
  'BZ',
  'CA',
  'CC',
  'CD',
  'CF',
  'CG',
  'CH',
  'CI',
  'CK',
  'CL',
  'CM',
  'CN',
  'CO',
  'CR',
  'CU',
  'CV',
  'CW',
  'CX',
  'CY',
  'CZ',
  'DE',
  'DJ',
  'DK',
  'DM',
  'DO',
  'DZ',
  'EC',
  'EE',
  'EG',
  'EH',
  'ER',
  'ES',
  'ET',
  'FI',
  'FJ',
  'FK',
  'FM',
  'FO',
  'FR',
  'GA',
  'GB',
  'GD',
  'GE',
  'GF',
  'GG',
  'GH',
  'GI',
  'GL',
  'GM',
  'GN',
  'GP',
  'GQ',
  'GR',
  'GS',
  'GT',
  'GU',
  'GW',
  'GY',
  'HK',
  'HM',
  'HN',
  'HR',
  'HT',
  'HU',
  'ID',
  'IE',
  'IL',
  'IM',
  'IN',
  'IO',
  'IQ',
  'IR',
  'IS',
  'IT',
  'JE',
  'JM',
  'JO',
  'JP',
  'KE',
  'KG',
  'KH',
  'KI',
  'KM',
  'KN',
  'KP',
  'KR',
  'KW',
  'KY',
  'KZ',
  'LA',
  'LB',
  'LC',
  'LI',
  'LK',
  'LR',
  'LS',
  'LT',
  'LU',
  'LV',
  'LY',
  'MA',
  'MC',
  'MD',
  'ME',
  'MF',
  'MG',
  'MH',
  'MK',
  'ML',
  'MM',
  'MN',
  'MO',
  'MP',
  'MQ',
  'MR',
  'MS',
  'MT',
  'MU',
  'MV',
  'MW',
  'MX',
  'MY',
  'MZ',
  'NA',
  'NC',
  'NE',
  'NF',
  'NG',
  'NI',
  'NL',
  'NO',
  'NP',
  'NR',
  'NU',
  'NZ',
  'OM',
  'PA',
  'PE',
  'PF',
  'PG',
  'PH',
  'PK',
  'PL',
  'PM',
  'PN',
  'PR',
  'PS',
  'PT',
  'PW',
  'PY',
  'QA',
  'RE',
  'RO',
  'RS',
  'RU',
  'RW',
  'SA',
  'SB',
  'SC',
  'SD',
  'SE',
  'SG',
  'SH',
  'SI',
  'SJ',
  'SK',
  'SL',
  'SM',
  'SN',
  'SO',
  'SR',
  'SS',
  'ST',
  'SV',
  'SX',
  'SY',
  'SZ',
  'TC',
  'TD',
  'TF',
  'TG',
  'TH',
  'TJ',
  'TK',
  'TL',
  'TM',
  'TN',
  'TO',
  'TR',
  'TT',
  'TV',
  'TW',
  'TZ',
  'UA',
  'UG',
  'UM',
  'US',
  'UY',
  'UZ',
  'VA',
  'VC',
  'VE',
  'VG',
  'VI',
  'VN',
  'VU',
  'WF',
  'WS',
  'YE',
  'YT',
  'ZA',
  'ZM',
  'ZW',
] as const;

export const NEWS_COUNTRY_CODES = [...ISO_3166_1_ALPHA_2, 'EU', 'XK'] as const;

export type NewsCountryCode = (typeof NEWS_COUNTRY_CODES)[number];

const NEWS_COUNTRY_CODE_SET = new Set<string>(NEWS_COUNTRY_CODES);

export const NEWS_COUNTRY_WINDOW_DAYS = 90;
export const NEWS_COUNTRY_WINDOW_MS = NEWS_COUNTRY_WINDOW_DAYS * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Window the map can show. `all` is every tagged story, not a day count. */
export type MapRange = 30 | 90 | 'all';

/** View box shared by the land path and the country dots. */
export const WORLD_MAP_WIDTH = 960;
export const WORLD_MAP_HEIGHT = 460;

const MIN_DOT_RADIUS = 6;
const MAX_DOT_RADIUS = 14;

/**
 * Approximate geographic centroids (longitude, latitude). EU is Brussels,
 * not a geographic centroid of the member states.
 */
const COUNTRY_CENTROIDS: Partial<Record<NewsCountryCode, { lon: number; lat: number }>> = {
  AE: { lon: 54.3, lat: 24.2 },
  AU: { lon: 134.0, lat: -25.3 },
  BH: { lon: 50.5577, lat: 26.0667 },
  BR: { lon: -51.9253, lat: -14.235 },
  BT: { lon: 90.4336, lat: 27.5142 },
  CA: { lon: -106.3468, lat: 56.1304 },
  DE: { lon: 10.4515, lat: 51.1657 },
  DK: { lon: 9.5018, lat: 56.2639 },
  EU: { lon: 4.3517, lat: 50.8503 },
  FR: { lon: 2.2137, lat: 46.2276 },
  GB: { lon: -2.5, lat: 54.0 },
  HK: { lon: 114.1694, lat: 22.3193 },
  IN: { lon: 78.9629, lat: 20.5937 },
  IT: { lon: 12.5674, lat: 41.8719 },
  JO: { lon: 36.2384, lat: 31.24 },
  KW: { lon: 47.4818, lat: 29.3117 },
  MY: { lon: 101.9758, lat: 4.2105 },
  NG: { lon: 8.6753, lat: 9.082 },
  NO: { lon: 8.4689, lat: 60.472 },
  NZ: { lon: 174.886, lat: -40.9006 },
  OM: { lon: 55.9754, lat: 21.4735 },
  SA: { lon: 45.0792, lat: 23.8859 },
  SE: { lon: 15.0, lat: 62.0 },
  US: { lon: -98.5795, lat: 39.8283 },
  UZ: { lon: 64.5853, lat: 41.3775 },
  XK: { lon: 21.0, lat: 42.6 },
};

export interface DatedCountryItem {
  /** One ISO code, or several when a story is about more than one country. */
  country?: string | readonly string[];
  date: Date;
}

export interface CountryCount {
  code: NewsCountryCode;
  count: number;
}

export interface CountryMapDot {
  code: NewsCountryCode;
  name: string;
  count: number;
  x: number;
  y: number;
  radius: number;
}

export interface NewsFilterItem {
  type: string;
  region: string;
  country?: string | readonly string[];
}

export interface NewsFilterState {
  type: string;
  region: string;
  country: string;
}

export function isNewsCountryCode(value: string): value is NewsCountryCode {
  return NEWS_COUNTRY_CODE_SET.has(value);
}

/**
 * Country code from a page query string. Lowercase input is accepted.
 * Missing and unknown values are ignored.
 */
export function countryFromSearch(search: string): NewsCountryCode | undefined {
  const value = new URLSearchParams(search).get('country');
  if (!value) return undefined;
  const code = value.trim().toUpperCase();
  return isNewsCountryCode(code) ? code : undefined;
}

/**
 * Search string with `country` set, or removed when the filter is cleared.
 * Other parameters are left in place. Unknown codes are not written.
 */
export function countryFilterSearch(search: string, country: string): string {
  const params = new URLSearchParams(search);
  if (country === 'all') params.delete('country');
  else if (isNewsCountryCode(country)) params.set('country', country);
  const query = params.toString();
  return query ? `?${query}` : '';
}

/** Unique valid codes from a single tag or a list. Invalid entries are dropped. */
export function newsCountries(country: string | readonly string[] | undefined): NewsCountryCode[] {
  const values = country == null ? [] : typeof country === 'string' ? [country] : country;
  const seen = new Set<NewsCountryCode>();
  const codes: NewsCountryCode[] = [];
  for (const value of values) {
    if (!isNewsCountryCode(value) || seen.has(value)) continue;
    seen.add(value);
    codes.push(value);
  }
  return codes;
}

export function itemHasCountry(
  country: string | readonly string[] | undefined,
  code: string
): boolean {
  return newsCountries(country).some((value) => value === code);
}

/** Lowercase path such as `/news/country/ae/` or `/news/country/eu/`. */
export function countryPagePath(code: NewsCountryCode): string {
  return `/news/country/${code.toLowerCase()}/`;
}

const STORY_LABELS: Partial<Record<NewsCountryCode, string>> = {
  AE: 'UAE',
  EU: 'EU',
  GB: 'UK',
  US: 'US',
};

/** Short name used in the trend sentence, such as "UAE". */
export function countryStoryLabel(code: NewsCountryCode): string {
  return STORY_LABELS[code] ?? countryName(code);
}

export function countryCountLabel(code: NewsCountryCode, count: number, range: MapRange): string {
  const stories = count === 1 ? 'story' : 'stories';
  const when = range === 'all' ? 'in total' : `in the last ${range} days`;
  return `${countryName(code)}, ${count} ${stories} ${when}`;
}

function rangeWindowMs(range: MapRange): number | null {
  switch (range) {
    case 30:
      return 30 * DAY_MS;
    case 90:
      return 90 * DAY_MS;
    case 'all':
      return null;
    default: {
      const exhaustive: never = range;
      return exhaustive;
    }
  }
}

export function countryName(code: string): string {
  if (code === 'EU') return 'European Union';
  if (code === 'HK') return 'Hong Kong';
  if (code === 'XK') return 'Kosovo';
  const name = new Intl.DisplayNames(['en'], { type: 'region' }).of(code);
  return name && name !== code ? name : code;
}

export function countryCentroid(code: NewsCountryCode): { lon: number; lat: number } | undefined {
  return COUNTRY_CENTROIDS[code];
}

export function projectEquirectangular(
  lon: number,
  lat: number,
  width: number,
  height: number
): { x: number; y: number } {
  return {
    x: ((lon + 180) / 360) * width,
    y: ((90 - lat) / 180) * height,
  };
}

export function dotRadius(count: number, maxCount: number): number {
  if (maxCount <= 0) return MIN_DOT_RADIUS;
  const scale = Math.sqrt(count / maxCount);
  return MIN_DOT_RADIUS + (MAX_DOT_RADIUS - MIN_DOT_RADIUS) * scale;
}

/**
 * Tagged items in the selected window, largest count first.
 * A story tagged with several countries counts once for each of them.
 * The default window is the last 90 days: [now - 90 days, now].
 */
export function countCountriesInWindow(
  items: readonly DatedCountryItem[],
  now: Date,
  range: MapRange = 90
): CountryCount[] {
  const windowMs = rangeWindowMs(range);
  const end = now.getTime();
  const start = windowMs == null ? Number.NEGATIVE_INFINITY : end - windowMs;
  const counts = new Map<NewsCountryCode, number>();

  for (const item of items) {
    const time = item.date.getTime();
    if (time < start || time > end) continue;
    for (const code of newsCountries(item.country)) {
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code));
}

function countInPreviousWindow(
  items: readonly DatedCountryItem[],
  now: Date,
  days: 30 | 90,
  code: NewsCountryCode
): number {
  const end = now.getTime() - days * DAY_MS;
  const start = end - days * DAY_MS;
  let count = 0;
  for (const item of items) {
    const time = item.date.getTime();
    if (time < start || time >= end) continue;
    if (newsCountries(item.country).includes(code)) count += 1;
  }
  return count;
}

/**
 * One sentence for the country with the most stories in the selected window.
 * A day window is compared with the window of the same length immediately before it.
 * All time has no earlier window, so the sentence does not invent a change.
 */
export function describeCountryTrend(
  items: readonly DatedCountryItem[],
  now: Date,
  range: MapRange
): string {
  const current = countCountriesInWindow(items, now, range);
  if (current.length === 0) {
    if (range === 'all') return 'No tagged stories yet.';
    return `No tagged stories in the last ${range} days.`;
  }

  const top = current[0];
  const label = countryStoryLabel(top.code);
  const stories = top.count === 1 ? 'story' : 'stories';
  const phrase = `${top.count} ${label} ${stories}`;
  if (range === 'all') return `${phrase} in total.`;

  const previous = countInPreviousWindow(items, now, range, top.code);
  if (previous === 0) {
    return `${phrase} in the last ${range} days. No ${label} stories in the previous ${range} days.`;
  }
  if (previous === top.count) {
    return `${phrase} in the last ${range} days, the same as the previous ${range}.`;
  }
  const direction = top.count > previous ? 'up from' : 'down from';
  return `${phrase} in the last ${range} days, ${direction} ${previous} in the previous ${range}.`;
}

/**
 * Dots for the build-time map. Larger dots are listed first so smaller
 * neighbours paint above them.
 */
export function countryMapDots(
  items: readonly DatedCountryItem[],
  now: Date,
  range: MapRange = 90
): CountryMapDot[] {
  const counts = countCountriesInWindow(items, now, range);
  const maxCount = counts.reduce((max, entry) => Math.max(max, entry.count), 0);
  const dots: CountryMapDot[] = [];

  for (const { code, count } of counts) {
    const centroid = countryCentroid(code);
    if (!centroid) continue;
    const point = projectEquirectangular(
      centroid.lon,
      centroid.lat,
      WORLD_MAP_WIDTH,
      WORLD_MAP_HEIGHT
    );
    dots.push({
      code,
      name: countryName(code),
      count,
      x: point.x,
      y: point.y,
      radius: dotRadius(count, maxCount),
    });
  }

  return dots;
}

/** Same rule as the updates page: type, region, and country must all match. */
export function matchesNewsFilters(item: NewsFilterItem, filters: NewsFilterState): boolean {
  const typeMatch = filters.type === 'all' || item.type === filters.type;
  const regionMatch = filters.region === 'all' || item.region === filters.region;
  const countryMatch = filters.country === 'all' || itemHasCountry(item.country, filters.country);
  return typeMatch && regionMatch && countryMatch;
}
