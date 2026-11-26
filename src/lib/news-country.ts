/**
 * News country tags. ISO 3166-1 alpha-2, plus `EU` for EU-level institutions
 * (Commission, Council, Parliament, EBA). `EU` is not an ISO country code.
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

export const NEWS_COUNTRY_CODES = [...ISO_3166_1_ALPHA_2, 'EU'] as const;

export type NewsCountryCode = (typeof NEWS_COUNTRY_CODES)[number];

const NEWS_COUNTRY_CODE_SET = new Set<string>(NEWS_COUNTRY_CODES);

export const NEWS_COUNTRY_WINDOW_DAYS = 90;
export const NEWS_COUNTRY_WINDOW_MS = NEWS_COUNTRY_WINDOW_DAYS * 24 * 60 * 60 * 1000;

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
  CA: { lon: -106.3468, lat: 56.1304 },
  EU: { lon: 4.3517, lat: 50.8503 },
  GB: { lon: -2.5, lat: 54.0 },
  JO: { lon: 36.2384, lat: 31.24 },
  KW: { lon: 47.4818, lat: 29.3117 },
  MY: { lon: 101.9758, lat: 4.2105 },
  NZ: { lon: 174.886, lat: -40.9006 },
  OM: { lon: 55.9754, lat: 21.4735 },
  SA: { lon: 45.0792, lat: 23.8859 },
  SE: { lon: 15.0, lat: 62.0 },
  US: { lon: -98.5795, lat: 39.8283 },
  UZ: { lon: 64.5853, lat: 41.3775 },
};

export interface DatedCountryItem {
  country?: string;
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
  country?: string;
}

export interface NewsFilterState {
  type: string;
  region: string;
  country: string;
}

export function isNewsCountryCode(value: string): value is NewsCountryCode {
  return NEWS_COUNTRY_CODE_SET.has(value);
}

export function countryName(code: string): string {
  if (code === 'EU') return 'European Union';
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

/** Tagged items whose date falls in [now - 90 days, now], largest count first. */
export function countCountriesInWindow(
  items: readonly DatedCountryItem[],
  now: Date
): CountryCount[] {
  const start = now.getTime() - NEWS_COUNTRY_WINDOW_MS;
  const end = now.getTime();
  const counts = new Map<NewsCountryCode, number>();

  for (const item of items) {
    if (!item.country || !isNewsCountryCode(item.country)) continue;
    const time = item.date.getTime();
    if (time < start || time > end) continue;
    counts.set(item.country, (counts.get(item.country) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code));
}

/**
 * Dots for the build-time map. Larger dots are listed first so smaller
 * neighbours paint above them.
 */
export function countryMapDots(items: readonly DatedCountryItem[], now: Date): CountryMapDot[] {
  const counts = countCountriesInWindow(items, now);
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
  const countryMatch = filters.country === 'all' || item.country === filters.country;
  return typeMatch && regionMatch && countryMatch;
}
