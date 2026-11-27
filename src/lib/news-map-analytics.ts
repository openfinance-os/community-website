/**
 * PostHog events for the news map and country pages.
 * Country codes, time ranges, and public story slugs only. No personal data.
 * Missing or broken PostHog must not affect the page.
 */
import {
  countryFromSearch,
  isNewsCountryCode,
  type MapRange,
  type NewsCountryCode,
} from '@lib/news-country';

export const NEWS_COUNTRY_SELECTED_EVENT = 'news_country_selected';
export const NEWS_COUNTRY_FILTER_CLEARED_EVENT = 'news_country_filter_cleared';
export const NEWS_MAP_RANGE_CHANGED_EVENT = 'news_map_range_changed';
export const NEWS_COUNTRY_PAGE_VIEWED_EVENT = 'news_country_page_viewed';
export const NEWS_FILTERED_STORY_CLICKED_EVENT = 'news_filtered_story_clicked';

export type NewsCountryInteractionSource = 'map_dot' | 'legend' | 'url';

/** Analytics form of a map window. `90` is the default 90-day view. */
export type NewsMapTimeRangeLabel = '30' | '90' | 'all';

const COUNTRY_PAGE_VIEW_KEY = 'newsCountryPageViewed';
const STORY_SLUG = /^[a-z0-9-]{1,180}$/i;

interface CountryInteraction {
  countryCode: string;
  timeRange: string;
  source: string;
}

interface InteractionProperties {
  country_code: string;
  time_range: NewsMapTimeRangeLabel;
  source: NewsCountryInteractionSource;
}

interface NewsMapEventProperties {
  country_code?: string;
  time_range?: string;
  previous_time_range?: string;
  source?: string;
  slug?: string;
}

function capture(event: string, properties: NewsMapEventProperties): void {
  try {
    if (typeof window === 'undefined' || typeof window.posthog?.capture !== 'function') return;
    const payload: Record<string, string> = { page_url: window.location.pathname };
    for (const [key, value] of Object.entries(properties)) {
      if (typeof value === 'string') payload[key] = value;
    }
    window.posthog.capture(event, payload);
  } catch {
    /* Analytics must never break the map or the news list. */
  }
}

export function isNewsMapTimeRange(value: string): value is NewsMapTimeRangeLabel {
  switch (value) {
    case '30':
    case '90':
    case 'all':
      return true;
    default:
      return false;
  }
}

function interactionSource(value: string): NewsCountryInteractionSource | undefined {
  switch (value) {
    case 'map_dot':
    case 'legend':
    case 'url':
      return value;
    default:
      return undefined;
  }
}

export function mapRangeLabel(range: MapRange): NewsMapTimeRangeLabel {
  switch (range) {
    case 30:
      return '30';
    case 90:
      return '90';
    case 'all':
      return 'all';
    default: {
      const exhaustive: never = range;
      return exhaustive;
    }
  }
}

function countryCode(value: string): string | undefined {
  return isNewsCountryCode(value) ? value : undefined;
}

function publicStorySlug(value: string): string | undefined {
  if (!STORY_SLUG.test(value)) return undefined;
  if (value.startsWith('-') || value.endsWith('-')) return undefined;
  return value;
}

function interactionProperties(input: CountryInteraction): InteractionProperties | undefined {
  const code = countryCode(input.countryCode);
  const source = interactionSource(input.source);
  if (!code || !source || !isNewsMapTimeRange(input.timeRange)) return undefined;
  return {
    country_code: code,
    time_range: input.timeRange,
    source,
  };
}

/** A country filter became active from a map dot, the legend, or a shared link. */
export function trackNewsCountrySelected(input: CountryInteraction): void {
  const properties = interactionProperties(input);
  if (!properties) return;
  capture(NEWS_COUNTRY_SELECTED_EVENT, properties);
}

function clearSource(source: NewsCountryInteractionSource): 'map_dot' | 'legend' | undefined {
  switch (source) {
    case 'map_dot':
    case 'legend':
      return source;
    case 'url':
      return undefined;
    default: {
      const exhaustive: never = source;
      return exhaustive;
    }
  }
}

/** The country filter was cleared from a map dot or the legend. */
export function trackNewsCountryFilterCleared(input: CountryInteraction): void {
  const properties = interactionProperties(input);
  if (!properties || !clearSource(properties.source)) return;
  capture(NEWS_COUNTRY_FILTER_CLEARED_EVENT, {
    country_code: properties.country_code,
    time_range: properties.time_range,
    source: properties.source,
  });
}

/** The 30-day / 90-day / all-time switch moved to a different range. */
export function trackNewsMapRangeChanged(input: {
  timeRange: string;
  previousTimeRange: string;
  countryCode?: string;
}): void {
  if (!isNewsMapTimeRange(input.timeRange) || !isNewsMapTimeRange(input.previousTimeRange)) return;
  if (input.timeRange === input.previousTimeRange) return;
  const code = input.countryCode ? countryCode(input.countryCode) : undefined;
  capture(NEWS_MAP_RANGE_CHANGED_EVENT, {
    time_range: input.timeRange,
    previous_time_range: input.previousTimeRange,
    ...(code ? { country_code: code } : {}),
  });
}

/** Landing on `/news/country/<code>/`. Counted once per page load. */
export function trackNewsCountryPageViewed(code: string): void {
  if (!countryCode(code) || typeof window === 'undefined') return;
  window.__analyticsInitialized = window.__analyticsInitialized || {};
  if (window.__analyticsInitialized[COUNTRY_PAGE_VIEW_KEY]) return;
  window.__analyticsInitialized[COUNTRY_PAGE_VIEW_KEY] = true;
  capture(NEWS_COUNTRY_PAGE_VIEWED_EVENT, {
    country_code: code,
    time_range: 'all',
    source: 'url',
  });
}

/** A news item opened from a country-filtered list. */
export function trackNewsFilteredStoryClicked(input: CountryInteraction & { slug: string }): void {
  const properties = interactionProperties(input);
  if (!properties) return;
  const slug = publicStorySlug(input.slug);
  capture(NEWS_FILTERED_STORY_CLICKED_EVENT, {
    ...properties,
    ...(slug ? { slug } : {}),
  });
}

/**
 * Same toggle as the updates page: clicking the active country, or
 * All countries, clears the filter. Returns the next country code.
 */
export function applyCountryFilterClick(input: {
  clickedCode: string;
  activeCountry: string;
  source: 'map_dot' | 'legend';
  timeRange: string;
}): string {
  const next =
    input.clickedCode !== 'all' && input.clickedCode === input.activeCountry
      ? 'all'
      : input.clickedCode;
  if (next === 'all') {
    trackNewsCountryFilterCleared({
      countryCode: input.activeCountry,
      timeRange: input.timeRange,
      source: input.source,
    });
  } else {
    trackNewsCountrySelected({
      countryCode: next,
      timeRange: input.timeRange,
      source: input.source,
    });
  }
  return next;
}

/** Shareable `/updates/?country=XX` landing. Unknown codes are ignored. */
export function recordUpdatesCountryLanding(
  search: string,
  timeRange: string
): NewsCountryCode | undefined {
  const code = countryFromSearch(search);
  if (!code) return undefined;
  trackNewsCountrySelected({ countryCode: code, timeRange, source: 'url' });
  return code;
}

export function readMapTimeRange(root: ParentNode = document): NewsMapTimeRangeLabel {
  const pressed = root.querySelector('[data-map-range][aria-pressed="true"]');
  const value = pressed?.getAttribute('data-map-range') ?? '';
  return isNewsMapTimeRange(value) ? value : '90';
}

export function readActiveCountryCode(root: ParentNode = document): string | undefined {
  const pressed = root.querySelectorAll('[data-country-filter][aria-pressed="true"]');
  for (const button of pressed) {
    const code = button.getAttribute('data-country-filter') ?? '';
    if (isNewsCountryCode(code)) return code;
  }
  return undefined;
}
