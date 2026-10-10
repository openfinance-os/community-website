/**
 * PostHog Analytics Utility
 *
 * Provides consistent event tracking across the site.
 * PostHog is loaded via CDN in BaseLayout.astro, so we access it via window.posthog
 */

import { outboundAttempt } from '../lib/engagement-events';

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
      identify: (distinctId: string, properties?: Record<string, unknown>) => void;
      register: (properties: Record<string, unknown>) => void;
      people?: {
        set: (properties: Record<string, unknown>) => void;
      };
    };
    __analyticsInitialized?: Record<string, boolean>;
    __enhancedAnalyticsInitialized?: boolean;
  }
}

/**
 * Track a custom event with PostHog
 */
export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture(event, {
      ...properties,
      page_url: window.location.pathname,
      page_title: document.title,
    });
  }
}

/**
 * Safely extract hostname from URL, returns null if invalid
 */
export function safeGetHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * Guard to prevent duplicate initialization of tracking scripts
 * Returns true if this is the first initialization, false if already initialized
 */
export function initOnce(key: string): boolean {
  if (typeof window === 'undefined') return false;
  window.__analyticsInitialized = window.__analyticsInitialized || {};
  if (window.__analyticsInitialized[key]) return false;
  window.__analyticsInitialized[key] = true;
  return true;
}

// ============================================
// Navigation Events
// ============================================

export function trackNavigation(destination: string, source: 'header' | 'mobile' | 'footer'): void {
  trackEvent('navigation_clicked', {
    destination,
    source,
  });
}

export function trackThemeToggle(newTheme: 'light' | 'dark'): void {
  trackEvent('theme_toggled', {
    new_theme: newTheme,
  });
}

export function trackExternalLink(url: string, context: string): void {
  if (typeof window === 'undefined') return;
  const attempt = outboundAttempt(url, window.location.href);
  if (attempt) trackEvent('external_link_clicked', { ...attempt, context });
}

// ============================================
// Search Events
// ============================================

export function trackSearchOpened(trigger: 'keyboard' | 'button'): void {
  trackEvent('search_opened', {
    trigger,
  });
}

export function trackSearchQuery(query: string, resultsCount: number): void {
  trackEvent('search_query', {
    query,
    query_length: query.length,
    results_count: resultsCount,
  });
}

export function trackSearchResultClicked(
  resultType: 'participant' | 'news' | 'page' | 'resource',
  resultTitle: string,
  resultUrl: string,
  position: number
): void {
  trackEvent('search_result_clicked', {
    result_type: resultType,
    result_title: resultTitle,
    result_url: resultUrl,
    position,
  });
}

export function trackQuickLinkClicked(linkName: string, linkUrl: string): void {
  trackEvent('quick_link_clicked', {
    link_name: linkName,
    link_url: linkUrl,
  });
}

// ============================================
// Filter Events
// ============================================

export function trackFilterApplied(
  filterType: 'news_type' | 'news_region' | 'event_type',
  filterValue: string
): void {
  trackEvent('filter_applied', {
    filter_type: filterType,
    filter_value: filterValue,
  });
}

export function trackSearchFilter(context: 'news' | 'events', query: string): void {
  trackEvent('filter_search', {
    context,
    query,
    query_length: query.length,
  });
}

// ============================================
// Content Events
// ============================================

export function trackNewsArticleClicked(
  title: string,
  slug: string,
  type: string,
  region: string,
  isExternal: boolean,
  source?: string
): void {
  trackEvent('news_article_clicked', {
    title,
    slug,
    type,
    region,
    is_external: isExternal,
    source: source || 'internal',
  });
}

export function trackEventCardClicked(
  title: string,
  slug: string,
  eventType: string,
  isPast: boolean
): void {
  trackEvent('event_clicked', {
    title,
    slug,
    event_type: eventType,
    is_past: isPast,
  });
}

// ============================================
// Observatory Events
// ============================================

export function trackParticipantViewed(
  name: string,
  slug: string,
  environment: 'production' | 'sandbox',
  type?: string
): void {
  trackEvent('participant_viewed', {
    name,
    slug,
    environment,
    participant_type: type,
  });
}

export function trackParticipantWebsiteClicked(participantName: string, websiteUrl: string): void {
  if (typeof window === 'undefined') return;
  const attempt = outboundAttempt(websiteUrl, window.location.href);
  if (attempt) {
    trackEvent('participant_website_clicked', { ...attempt, participant_name: participantName });
  }
}

export function trackEnvironmentSwitched(
  newEnvironment: 'production' | 'sandbox',
  previousEnvironment: 'production' | 'sandbox'
): void {
  trackEvent('environment_switched', {
    new_environment: newEnvironment,
    previous_environment: previousEnvironment,
  });
}

// ============================================
// Engagement Events
// ============================================

export function trackGitHubClicked(source: 'header' | 'mobile' | 'footer'): void {
  trackEvent('github_clicked', {
    source,
  });
}

// ============================================
// Helper to attach tracking to elements
// ============================================

export function attachClickTracking(
  selector: string,
  eventName: string,
  getProperties?: (element: Element) => Record<string, unknown>
): void {
  document.querySelectorAll(selector).forEach((element) => {
    element.addEventListener('click', () => {
      const properties = getProperties ? getProperties(element) : {};
      trackEvent(eventName, properties);
    });
  });
}
