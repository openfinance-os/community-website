/**
 * @vitest-environment happy-dom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  NEWS_COUNTRY_FILTER_CLEARED_EVENT,
  NEWS_COUNTRY_PAGE_VIEWED_EVENT,
  NEWS_COUNTRY_SELECTED_EVENT,
  NEWS_FILTERED_STORY_CLICKED_EVENT,
  NEWS_MAP_RANGE_CHANGED_EVENT,
  applyCountryFilterClick,
  readActiveCountryCode,
  readMapTimeRange,
  recordUpdatesCountryLanding,
  trackNewsCountryFilterCleared,
  trackNewsCountryPageViewed,
  trackNewsCountrySelected,
  trackNewsFilteredStoryClicked,
  trackNewsMapRangeChanged,
} from '../news-map-analytics';

function installPostHog(capture: (...args: unknown[]) => void) {
  window.posthog = {
    capture: (event, properties) => {
      capture(event, properties);
    },
    identify: () => {},
    register: () => {},
  };
}

afterEach(() => {
  document.body.innerHTML = '';
  document.documentElement.className = '';
  delete window.posthog;
  delete window.__analyticsInitialized;
  window.history.pushState({}, '', '/');
});

describe('trackNewsCountrySelected', () => {
  it('captures a country pick with code, range, and source', () => {
    const capture = vi.fn();
    installPostHog(capture);
    window.history.pushState({}, '', '/updates/?country=AE');

    trackNewsCountrySelected({ countryCode: 'AE', timeRange: '90', source: 'map_dot' });

    expect(capture).toHaveBeenCalledWith(NEWS_COUNTRY_SELECTED_EVENT, {
      country_code: 'AE',
      time_range: '90',
      source: 'map_dot',
      page_url: '/updates/',
    });
  });

  it('accepts legend and url sources', () => {
    const capture = vi.fn();
    installPostHog(capture);

    trackNewsCountrySelected({ countryCode: 'EU', timeRange: '30', source: 'legend' });
    trackNewsCountrySelected({ countryCode: 'KW', timeRange: 'all', source: 'url' });

    expect(capture).toHaveBeenNthCalledWith(
      1,
      NEWS_COUNTRY_SELECTED_EVENT,
      expect.objectContaining({ country_code: 'EU', time_range: '30', source: 'legend' })
    );
    expect(capture).toHaveBeenNthCalledWith(
      2,
      NEWS_COUNTRY_SELECTED_EVENT,
      expect.objectContaining({ country_code: 'KW', time_range: 'all', source: 'url' })
    );
  });

  it('drops unknown countries, ranges, and sources', () => {
    const capture = vi.fn();
    installPostHog(capture);

    trackNewsCountrySelected({ countryCode: 'ZZ', timeRange: '90', source: 'map_dot' });
    trackNewsCountrySelected({ countryCode: 'ae', timeRange: '90', source: 'legend' });
    trackNewsCountrySelected({ countryCode: 'AE', timeRange: '7', source: 'legend' });
    trackNewsCountrySelected({ countryCode: 'AE', timeRange: '90', source: 'query' });

    expect(capture).not.toHaveBeenCalled();
  });

  it('does nothing when PostHog is absent', () => {
    expect(() =>
      trackNewsCountrySelected({ countryCode: 'AE', timeRange: '90', source: 'legend' })
    ).not.toThrow();
  });

  it('swallows a capture failure', () => {
    window.posthog = {
      capture: () => {
        throw new Error('blocked');
      },
      identify: () => {},
      register: () => {},
    };

    expect(() =>
      trackNewsCountrySelected({ countryCode: 'AE', timeRange: '90', source: 'map_dot' })
    ).not.toThrow();
  });
});

describe('trackNewsCountryFilterCleared', () => {
  it('captures the country that was cleared', () => {
    const capture = vi.fn();
    installPostHog(capture);
    window.history.pushState({}, '', '/updates/');

    trackNewsCountryFilterCleared({ countryCode: 'GB', timeRange: '90', source: 'legend' });

    expect(capture).toHaveBeenCalledWith(NEWS_COUNTRY_FILTER_CLEARED_EVENT, {
      country_code: 'GB',
      time_range: '90',
      source: 'legend',
      page_url: '/updates/',
    });
  });

  it('does nothing when PostHog is absent, the code is not a country, or the source is a landing', () => {
    expect(() =>
      trackNewsCountryFilterCleared({ countryCode: 'AE', timeRange: '30', source: 'map_dot' })
    ).not.toThrow();

    const capture = vi.fn();
    installPostHog(capture);
    trackNewsCountryFilterCleared({ countryCode: 'all', timeRange: '90', source: 'legend' });
    trackNewsCountryFilterCleared({ countryCode: 'AE', timeRange: '90', source: 'url' });
    expect(capture).not.toHaveBeenCalled();
  });
});

describe('trackNewsMapRangeChanged', () => {
  it('captures the new range, the previous range, and an active country', () => {
    const capture = vi.fn();
    installPostHog(capture);

    trackNewsMapRangeChanged({
      timeRange: 'all',
      previousTimeRange: '90',
      countryCode: 'AE',
    });

    expect(capture).toHaveBeenCalledWith(NEWS_MAP_RANGE_CHANGED_EVENT, {
      time_range: 'all',
      previous_time_range: '90',
      country_code: 'AE',
      page_url: '/',
    });
  });

  it('omits country_code when no country filter is active', () => {
    const capture = vi.fn();
    installPostHog(capture);

    trackNewsMapRangeChanged({ timeRange: '30', previousTimeRange: '90' });

    expect(capture).toHaveBeenCalledWith(NEWS_MAP_RANGE_CHANGED_EVENT, {
      time_range: '30',
      previous_time_range: '90',
      page_url: '/',
    });
    expect(capture.mock.calls[0][1]).not.toHaveProperty('country_code');
  });

  it('skips a click that does not change the range', () => {
    const capture = vi.fn();
    installPostHog(capture);

    trackNewsMapRangeChanged({ timeRange: '90', previousTimeRange: '90', countryCode: 'AE' });

    expect(capture).not.toHaveBeenCalled();
  });

  it('does nothing when PostHog is absent', () => {
    expect(() =>
      trackNewsMapRangeChanged({ timeRange: 'all', previousTimeRange: '30' })
    ).not.toThrow();
  });
});

describe('trackNewsCountryPageViewed', () => {
  it('captures a country page landing once', () => {
    const capture = vi.fn();
    installPostHog(capture);
    window.history.pushState({}, '', '/news/country/ae/');

    trackNewsCountryPageViewed('AE');
    trackNewsCountryPageViewed('AE');

    expect(capture).toHaveBeenCalledTimes(1);
    expect(capture).toHaveBeenCalledWith(NEWS_COUNTRY_PAGE_VIEWED_EVENT, {
      country_code: 'AE',
      time_range: 'all',
      source: 'url',
      page_url: '/news/country/ae/',
    });
  });

  it('ignores an unknown code and a missing PostHog', () => {
    const capture = vi.fn();
    installPostHog(capture);
    trackNewsCountryPageViewed('zz');
    expect(capture).not.toHaveBeenCalled();

    delete window.posthog;
    expect(() => trackNewsCountryPageViewed('EU')).not.toThrow();
  });
});

describe('trackNewsFilteredStoryClicked', () => {
  it('captures the public slug from a filtered updates list', () => {
    const capture = vi.fn();
    installPostHog(capture);
    window.history.pushState({}, '', '/updates/?country=KW');

    trackNewsFilteredStoryClicked({
      countryCode: 'KW',
      timeRange: '30',
      source: 'map_dot',
      slug: '2026-11-11-cbk-issues-open-banking-regulatory-framework',
    });

    expect(capture).toHaveBeenCalledWith(NEWS_FILTERED_STORY_CLICKED_EVENT, {
      country_code: 'KW',
      time_range: '30',
      source: 'map_dot',
      slug: '2026-11-11-cbk-issues-open-banking-regulatory-framework',
      page_url: '/updates/',
    });
    expect(JSON.stringify(capture.mock.calls[0][1])).not.toContain('country=KW');
  });

  it('omits a slug that is not a public content id', () => {
    const capture = vi.fn();
    installPostHog(capture);

    trackNewsFilteredStoryClicked({
      countryCode: 'AE',
      timeRange: 'all',
      source: 'url',
      slug: 'reader@example.com',
    });

    expect(capture).toHaveBeenCalledWith(
      NEWS_FILTERED_STORY_CLICKED_EVENT,
      expect.not.objectContaining({ slug: expect.anything() })
    );
  });

  it('does nothing when PostHog is absent', () => {
    expect(() =>
      trackNewsFilteredStoryClicked({
        countryCode: 'AE',
        timeRange: '90',
        source: 'legend',
        slug: 'a-story',
      })
    ).not.toThrow();
  });
});

describe('applyCountryFilterClick', () => {
  it('selects a legend country and a map dot', () => {
    const capture = vi.fn();
    installPostHog(capture);

    expect(
      applyCountryFilterClick({
        clickedCode: 'EU',
        activeCountry: 'all',
        source: 'legend',
        timeRange: '90',
      })
    ).toBe('EU');
    expect(
      applyCountryFilterClick({
        clickedCode: 'KW',
        activeCountry: 'EU',
        source: 'map_dot',
        timeRange: '90',
      })
    ).toBe('KW');

    expect(capture).toHaveBeenNthCalledWith(
      1,
      NEWS_COUNTRY_SELECTED_EVENT,
      expect.objectContaining({ country_code: 'EU', source: 'legend', time_range: '90' })
    );
    expect(capture).toHaveBeenNthCalledWith(
      2,
      NEWS_COUNTRY_SELECTED_EVENT,
      expect.objectContaining({ country_code: 'KW', source: 'map_dot' })
    );
  });

  it('clears the filter when the active country or All countries is clicked', () => {
    const capture = vi.fn();
    installPostHog(capture);

    expect(
      applyCountryFilterClick({
        clickedCode: 'AE',
        activeCountry: 'AE',
        source: 'map_dot',
        timeRange: 'all',
      })
    ).toBe('all');
    expect(
      applyCountryFilterClick({
        clickedCode: 'all',
        activeCountry: 'SA',
        source: 'legend',
        timeRange: '30',
      })
    ).toBe('all');
    expect(
      applyCountryFilterClick({
        clickedCode: 'all',
        activeCountry: 'all',
        source: 'legend',
        timeRange: '90',
      })
    ).toBe('all');

    expect(capture).toHaveBeenCalledTimes(2);
    expect(capture).toHaveBeenNthCalledWith(
      1,
      NEWS_COUNTRY_FILTER_CLEARED_EVENT,
      expect.objectContaining({ country_code: 'AE', source: 'map_dot', time_range: 'all' })
    );
    expect(capture).toHaveBeenNthCalledWith(
      2,
      NEWS_COUNTRY_FILTER_CLEARED_EVENT,
      expect.objectContaining({ country_code: 'SA', source: 'legend', time_range: '30' })
    );
  });

  it('still returns the next filter when PostHog is absent', () => {
    expect(
      applyCountryFilterClick({
        clickedCode: 'GB',
        activeCountry: 'all',
        source: 'legend',
        timeRange: '90',
      })
    ).toBe('GB');
  });
});

describe('recordUpdatesCountryLanding', () => {
  it('records a shareable country link and ignores unknown codes', () => {
    const capture = vi.fn();
    installPostHog(capture);

    expect(recordUpdatesCountryLanding('?country=ae', '90')).toBe('AE');
    expect(recordUpdatesCountryLanding('?country=ZZ', '90')).toBeUndefined();
    expect(recordUpdatesCountryLanding('', '90')).toBeUndefined();

    expect(capture).toHaveBeenCalledTimes(1);
    expect(capture).toHaveBeenCalledWith(
      NEWS_COUNTRY_SELECTED_EVENT,
      expect.objectContaining({ country_code: 'AE', time_range: '90', source: 'url' })
    );
  });

  it('returns the country when PostHog is absent', () => {
    expect(recordUpdatesCountryLanding('?country=EU', '90')).toBe('EU');
  });
});

describe('map range and country readers', () => {
  it('reads the pressed range and falls back to 90 days', () => {
    document.body.innerHTML = `
      <div>
        <button data-map-range="30" aria-pressed="false"></button>
        <button data-map-range="90" aria-pressed="true"></button>
        <button data-map-range="all" aria-pressed="false"></button>
      </div>
    `;
    expect(readMapTimeRange()).toBe('90');

    document.querySelector('[data-map-range="90"]')?.setAttribute('aria-pressed', 'false');
    document.querySelector('[data-map-range="all"]')?.setAttribute('aria-pressed', 'true');
    expect(readMapTimeRange()).toBe('all');

    document.body.innerHTML = '';
    expect(readMapTimeRange()).toBe('90');
  });

  it('reads the pressed country and ignores All countries', () => {
    document.body.innerHTML = `
      <button class="map-dot" data-country-filter="KW" aria-pressed="true"></button>
      <button class="legend-btn" data-country-filter="all" aria-pressed="false"></button>
      <button class="legend-btn" data-country-filter="KW" aria-pressed="true"></button>
    `;
    expect(readActiveCountryCode()).toBe('KW');

    document.querySelectorAll('[data-country-filter="KW"]').forEach((button) => {
      button.setAttribute('aria-pressed', 'false');
    });
    document.querySelector('[data-country-filter="all"]')?.setAttribute('aria-pressed', 'true');
    expect(readActiveCountryCode()).toBeUndefined();
  });
});
