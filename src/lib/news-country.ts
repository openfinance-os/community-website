/** ISO 3166-1 alpha-2 codes, plus EU for European Union-wide stories. */
const ISO_ALPHA2 = [
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

export const COUNTRY_CODES: ReadonlySet<string> = new Set([...ISO_ALPHA2, 'EU']);

/** Geographic centroids as [longitude, latitude]. EU is a Brussels-area point. */
const COUNTRY_CENTROIDS: Record<string, readonly [number, number]> = {
  AE: [53.8478, 23.4241],
  AT: [14.5501, 47.5162],
  AU: [133.7751, -25.2744],
  BE: [4.4699, 50.5039],
  BH: [50.5577, 26.0667],
  BR: [-51.9253, -14.235],
  BT: [90.4336, 27.5142],
  CA: [-106.3468, 56.1304],
  CH: [8.2275, 46.8182],
  CN: [104.1954, 35.8617],
  DE: [10.4515, 51.1657],
  DK: [9.5018, 56.2639],
  EG: [30.8025, 26.8206],
  ES: [-3.7492, 40.4637],
  EU: [4.3517, 50.8503],
  FI: [25.7482, 61.9241],
  FR: [2.2137, 46.2276],
  GB: [-3.436, 55.3781],
  GR: [21.8243, 39.0742],
  HK: [114.1694, 22.3193],
  ID: [113.9213, -0.7893],
  IE: [-8.2439, 53.4129],
  IN: [78.9629, 20.5937],
  IT: [12.5674, 41.8719],
  JO: [36.2384, 30.5852],
  JP: [138.2529, 36.2048],
  KR: [127.7669, 35.9078],
  KW: [47.4818, 29.3117],
  MX: [-102.5528, 23.6345],
  MY: [101.9758, 4.2105],
  NG: [8.6753, 9.082],
  NL: [5.2913, 52.1326],
  NO: [8.4689, 60.472],
  NZ: [174.886, -40.9006],
  OM: [55.9754, 21.4735],
  PL: [19.1451, 51.9194],
  PT: [-8.2245, 39.3999],
  QA: [51.1839, 25.3548],
  SA: [45.0792, 23.8859],
  SE: [18.6435, 60.1282],
  SG: [103.8198, 1.3521],
  US: [-95.7129, 37.0902],
  UZ: [64.5853, 41.3775],
  ZA: [22.9375, -30.5595],
};

const COUNTRY_NAMES: Record<string, string> = {
  AE: 'United Arab Emirates',
  AT: 'Austria',
  AU: 'Australia',
  BE: 'Belgium',
  BH: 'Bahrain',
  BR: 'Brazil',
  BT: 'Bhutan',
  CA: 'Canada',
  CH: 'Switzerland',
  CN: 'China',
  DE: 'Germany',
  DK: 'Denmark',
  EG: 'Egypt',
  ES: 'Spain',
  EU: 'European Union',
  FI: 'Finland',
  FR: 'France',
  GB: 'United Kingdom',
  GR: 'Greece',
  HK: 'Hong Kong',
  ID: 'Indonesia',
  IE: 'Ireland',
  IN: 'India',
  IT: 'Italy',
  JO: 'Jordan',
  JP: 'Japan',
  KR: 'South Korea',
  KW: 'Kuwait',
  MX: 'Mexico',
  MY: 'Malaysia',
  NG: 'Nigeria',
  NL: 'Netherlands',
  NO: 'Norway',
  NZ: 'New Zealand',
  OM: 'Oman',
  PL: 'Poland',
  PT: 'Portugal',
  QA: 'Qatar',
  SA: 'Saudi Arabia',
  SE: 'Sweden',
  SG: 'Singapore',
  US: 'United States',
  UZ: 'Uzbekistan',
  ZA: 'South Africa',
};

export const NEWS_COUNTRY_WINDOW_DAYS = 90;
export const NEWS_MAP_WIDTH = 960;
export const NEWS_MAP_HEIGHT = 480;

const DAY_MS = 24 * 60 * 60 * 1000;

export function isCountryCode(value: string): boolean {
  return COUNTRY_CODES.has(value);
}

export function countryName(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}

export function countryCodes(value: string | string[] | undefined | null): string[] {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  const seen = new Set<string>();
  const codes: string[] = [];
  for (const code of list) {
    if (!isCountryCode(code) || seen.has(code)) continue;
    seen.add(code);
    codes.push(code);
  }
  return codes;
}

export interface NewsCountrySource {
  date: Date;
  country?: string | string[] | null;
}

export interface CountryCount {
  code: string;
  name: string;
  count: number;
  longitude: number | null;
  latitude: number | null;
}

export function newsCountryCounts(
  items: NewsCountrySource[],
  now: Date,
  windowDays = NEWS_COUNTRY_WINDOW_DAYS
): CountryCount[] {
  const cutoff = now.getTime() - windowDays * DAY_MS;
  const counts = new Map<string, number>();
  for (const item of items) {
    if (item.date.getTime() < cutoff) continue;
    for (const code of countryCodes(item.country)) {
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([code, count]) => {
      const point = COUNTRY_CENTROIDS[code];
      return {
        code,
        name: countryName(code),
        count,
        longitude: point ? point[0] : null,
        latitude: point ? point[1] : null,
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function project(
  longitude: number,
  latitude: number,
  width = NEWS_MAP_WIDTH,
  height = NEWS_MAP_HEIGHT
): { x: number; y: number } {
  return {
    x: ((longitude + 180) / 360) * width,
    y: ((90 - latitude) / 180) * height,
  };
}

export function dotRadius(count: number, maxCount: number): number {
  const min = 8;
  const max = 16;
  if (maxCount <= 1 || count <= 1) return min;
  const span = Math.sqrt((count - 1) / (maxCount - 1));
  return min + span * (max - min);
}

export type TipPlacement = 'above' | 'below';
export type TipAlign = 'center' | 'start' | 'end';

export interface MapDot {
  code: string;
  name: string;
  count: number;
  left: number;
  top: number;
  radius: number;
  label: string;
  placement: TipPlacement;
  align: TipAlign;
  showName: boolean;
}

export function storyLabel(name: string, count: number): string {
  const noun = count === 1 ? 'story' : 'stories';
  return `${name}, ${count} ${noun}`;
}

function hasPoint(
  item: CountryCount
): item is CountryCount & { longitude: number; latitude: number } {
  return item.longitude !== null && item.latitude !== null;
}

export function mapDots(
  counts: CountryCount[],
  width = NEWS_MAP_WIDTH,
  height = NEWS_MAP_HEIGHT
): MapDot[] {
  const plottable = counts.filter(hasPoint);
  const maxCount = plottable.reduce((max, item) => Math.max(max, item.count), 0);
  return plottable.map((item) => {
    const point = project(item.longitude, item.latitude, width, height);
    const left = (point.x / width) * 100;
    const top = (point.y / height) * 100;
    const placement: TipPlacement = top < 20 ? 'below' : 'above';
    const align: TipAlign = left > 72 ? 'end' : left < 28 ? 'start' : 'center';
    return {
      code: item.code,
      name: item.name,
      count: item.count,
      left,
      top,
      radius: dotRadius(item.count, maxCount),
      label: storyLabel(item.name, item.count),
      placement,
      align,
      showName: item.code === 'EU',
    };
  });
}

export function cardMatchesCountry(countries: string | null, active: string | null): boolean {
  if (!active) return true;
  return (countries ?? '').split(/\s+/).filter(Boolean).includes(active);
}

export function readCountryParam(search: string): string | null {
  const value = new URLSearchParams(search).get('country');
  if (!value) return null;
  const code = value.trim().toUpperCase();
  return isCountryCode(code) ? code : null;
}
