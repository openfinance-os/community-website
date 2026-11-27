/**
 * Enhanced PostHog Analytics
 *
 * Provides advanced tracking capabilities:
 * - UTM parameter capture & marketing attribution
 * - Scroll depth tracking
 * - Engagement time tracking
 * - Outbound link tracking
 * - Page performance metrics (Core Web Vitals)
 */

import { outboundAttempt } from '../lib/engagement-events';

// Types are declared in analytics.ts

/**
 * Initialize all enhanced analytics features
 * Should be called once per page load
 */
export function initEnhancedAnalytics(): void {
  if (typeof window === 'undefined') return;
  clearRetiredIdentifiers();
  // Watch uses explicit navigation events; the editable worksheet excludes analytics.
  if (/^\/(?:observatory\/watch|learn\/readiness)\/?$/.test(window.location.pathname)) return;
  if (window.__enhancedAnalyticsInitialized) return;
  window.__enhancedAnalyticsInitialized = true;

  // Wait for PostHog to be ready
  const initWhenReady = () => {
    if (window.posthog) {
      captureUTMParameters();
      captureReferrer();
      initScrollDepthTracking();
      initEngagementTracking();
      initOutboundLinkTracking();
      initPerformanceTracking();
    } else {
      // Retry after a short delay if PostHog isn't loaded yet
      setTimeout(initWhenReady, 100);
    }
  };

  if (document.readyState === 'complete') {
    initWhenReady();
  } else {
    window.addEventListener('load', initWhenReady);
  }
}

// ============================================
// UTM Parameter & Referrer Tracking
// ============================================

function captureUTMParameters(): void {
  const params = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};

  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  utmKeys.forEach((key) => {
    const value = params.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });

  // Only track if we have UTM parameters
  if (Object.keys(utmParams).length > 0) {
    // Store in session for attribution across pages
    sessionStorage.setItem('utm_params', JSON.stringify(utmParams));

    // Register as super properties (attached to all events)
    window.posthog?.register(utmParams);

    // Track the campaign visit
    window.posthog?.capture('campaign_visit', {
      ...utmParams,
      landing_page: window.location.pathname,
    });
  } else {
    // Check if we have stored UTM params from earlier in the session
    const storedParams = sessionStorage.getItem('utm_params');
    if (storedParams) {
      try {
        const parsed = JSON.parse(storedParams);
        window.posthog?.register(parsed);
      } catch {
        // Ignore parse errors
      }
    }
  }
}

function captureReferrer(): void {
  const referrer = document.referrer;
  if (!referrer) return;

  try {
    const referrerUrl = new URL(referrer);
    const currentHost = window.location.hostname;

    // Only track external referrers
    if (referrerUrl.hostname !== currentHost) {
      const referrerData = {
        referrer_url: referrer,
        referrer_domain: referrerUrl.hostname,
        referrer_path: referrerUrl.pathname,
      };

      // Store first referrer in session
      if (!sessionStorage.getItem('first_referrer')) {
        sessionStorage.setItem('first_referrer', JSON.stringify(referrerData));
        window.posthog?.register({
          initial_referrer: referrerUrl.hostname,
          initial_referrer_url: referrer,
        });
      }

      window.posthog?.capture('referrer_detected', referrerData);
    }
  } catch {
    // Invalid referrer URL, ignore
  }
}

// ============================================
// Retired visitor identifiers
// ============================================

// Earlier versions stored a persistent visitor ID and visit counts in
// localStorage. The privacy notice (/privacy) promises no identifier that
// outlives the tab, so clear those keys for returning browsers.
const RETIRED_VISITOR_KEYS = [
  'ofos_visitor_id',
  'ofos_visit_count',
  'ofos_first_visit',
  'ofos_last_visit',
];

// PostHog used to persist its ID in a `ph_*_posthog` cookie and localStorage
// entry. It now keeps it in sessionStorage, so remove the old copies too.
const RETIRED_POSTHOG_PATTERN = /^ph_.+_posthog$/;

export function retiredStorageKeys(keys: string[]): string[] {
  return keys.filter(
    (key) => RETIRED_VISITOR_KEYS.includes(key) || RETIRED_POSTHOG_PATTERN.test(key)
  );
}

export function retiredCookieNames(cookieHeader: string): string[] {
  return cookieHeader
    .split(';')
    .map((part) => part.split('=')[0].trim())
    .filter((name) => RETIRED_POSTHOG_PATTERN.test(name));
}

function clearRetiredIdentifiers(): void {
  try {
    const storage = window.localStorage;
    const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i) ?? '');
    for (const key of retiredStorageKeys(keys)) storage.removeItem(key);
  } catch {
    // Storage can be unavailable (private mode, blocked site data).
  }
  try {
    const host = window.location.hostname;
    const parentDomain = host.replace(/^www\./, '');
    for (const name of retiredCookieNames(document.cookie)) {
      for (const domain of ['', `; domain=${host}`, `; domain=.${parentDomain}`]) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
      }
    }
  } catch {
    // Cookie access can throw in sandboxed frames.
  }
}

// ============================================
// Scroll Depth Tracking
// ============================================

function initScrollDepthTracking(): void {
  const thresholds = [25, 50, 75, 90, 100];
  const trackedThresholds = new Set<number>();
  let maxScrollDepth = 0;

  const getScrollDepth = (): number => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return 100; // Page fits in viewport
    return Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
  };

  const trackScrollDepth = () => {
    const depth = getScrollDepth();
    maxScrollDepth = Math.max(maxScrollDepth, depth);

    thresholds.forEach((threshold) => {
      if (depth >= threshold && !trackedThresholds.has(threshold)) {
        trackedThresholds.add(threshold);
        window.posthog?.capture('scroll_depth', {
          depth_percent: threshold,
          page_path: window.location.pathname,
          page_height: document.documentElement.scrollHeight,
        });
      }
    });
  };

  // Throttled scroll handler
  let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  window.addEventListener(
    'scroll',
    () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        trackScrollDepth();
        scrollTimeout = null;
      }, 200);
    },
    { passive: true }
  );

  // Track max scroll depth when leaving page
  window.addEventListener('beforeunload', () => {
    if (maxScrollDepth > 0) {
      window.posthog?.capture('page_scroll_summary', {
        max_scroll_depth: maxScrollDepth,
        page_path: window.location.pathname,
        thresholds_reached: Array.from(trackedThresholds).sort((a, b) => a - b),
      });
    }
  });
}

// ============================================
// Engagement Time Tracking
// ============================================

function initEngagementTracking(): void {
  let engagedTime = 0;
  let lastActiveTime = Date.now();
  let isPageVisible = !document.hidden;
  let isUserActive = true;
  let activityTimeout: ReturnType<typeof setTimeout> | null = null;
  const IDLE_THRESHOLD = 30000; // 30 seconds of no activity = idle

  const updateEngagedTime = () => {
    if (isPageVisible && isUserActive) {
      const now = Date.now();
      engagedTime += now - lastActiveTime;
      lastActiveTime = now;
    }
  };

  const markActive = () => {
    if (!isUserActive) {
      isUserActive = true;
      lastActiveTime = Date.now();
    }

    if (activityTimeout) clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
      updateEngagedTime();
      isUserActive = false;
    }, IDLE_THRESHOLD);
  };

  // Track visibility changes
  document.addEventListener('visibilitychange', () => {
    updateEngagedTime();
    isPageVisible = !document.hidden;
    if (isPageVisible) {
      lastActiveTime = Date.now();
    }
  });

  // Track user activity
  const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
  activityEvents.forEach((event) => {
    document.addEventListener(event, markActive, { passive: true });
  });

  // Start activity tracking
  markActive();

  // Track engagement time when leaving
  window.addEventListener('beforeunload', () => {
    updateEngagedTime();
    const totalSeconds = Math.round(engagedTime / 1000);

    if (totalSeconds > 0) {
      window.posthog?.capture('page_engagement', {
        engaged_seconds: totalSeconds,
        engaged_time_bucket: getTimeBucket(totalSeconds),
        page_path: window.location.pathname,
        was_active: isUserActive,
      });
    }
  });
}

function getTimeBucket(seconds: number): string {
  if (seconds < 10) return '0-10s';
  if (seconds < 30) return '10-30s';
  if (seconds < 60) return '30-60s';
  if (seconds < 180) return '1-3min';
  if (seconds < 300) return '3-5min';
  if (seconds < 600) return '5-10min';
  return '10min+';
}

// ============================================
// Outbound Link Tracking
// ============================================

function initOutboundLinkTracking(): void {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || !(e.target instanceof Element)) return;
    const link = e.target.closest<HTMLAnchorElement>('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    const attempt = outboundAttempt(href, window.location.href);
    if (attempt) {
      window.posthog?.capture('outbound_link_clicked', {
        ...attempt,
        link_location: getLinkLocation(link),
        page_path: window.location.pathname,
      });
    }
  });
}

function getLinkLocation(link: HTMLElement): string {
  // Determine where in the page the link is located
  if (link.closest('header') || link.closest('.header')) return 'header';
  if (link.closest('footer') || link.closest('.footer')) return 'footer';
  if (link.closest('nav')) return 'navigation';
  if (link.closest('.news-card')) return 'news_card';
  if (link.closest('.event-card')) return 'event_card';
  if (link.closest('.participant-card')) return 'participant_card';
  if (link.closest('article')) return 'article';
  if (link.closest('aside')) return 'sidebar';
  return 'content';
}

// ============================================
// Page Performance Tracking (Core Web Vitals)
// ============================================

function initPerformanceTracking(): void {
  // Use Performance Observer API for Core Web Vitals
  if (!('PerformanceObserver' in window)) return;

  const metrics: Record<string, number> = {};

  // Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
      metrics.lcp = Math.round(lastEntry.startTime);
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // LCP not supported
  }

  // First Input Delay (FID)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0] as PerformanceEntry & {
        processingStart: number;
        startTime: number;
      };
      metrics.fid = Math.round(firstEntry.processingStart - firstEntry.startTime);
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch {
    // FID not supported
  }

  // Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & {
        hadRecentInput: boolean;
        value: number;
      })[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      metrics.cls = Math.round(clsValue * 1000) / 1000;
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch {
    // CLS not supported
  }

  // Time to First Byte (TTFB) and other navigation metrics
  try {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      metrics.ttfb = Math.round(navEntry.responseStart - navEntry.requestStart);
      metrics.dom_interactive = Math.round(navEntry.domInteractive);
      metrics.dom_complete = Math.round(navEntry.domComplete);
      metrics.load_time = Math.round(navEntry.loadEventEnd - navEntry.startTime);
    }
  } catch {
    // Navigation timing not supported
  }

  // Send performance data after page load
  window.addEventListener('load', () => {
    // Wait a bit for LCP and CLS to settle
    setTimeout(() => {
      if (Object.keys(metrics).length > 0) {
        // Categorize performance
        const lcpRating = metrics.lcp
          ? metrics.lcp < 2500
            ? 'good'
            : metrics.lcp < 4000
              ? 'needs_improvement'
              : 'poor'
          : 'unknown';
        const fidRating =
          metrics.fid !== undefined
            ? metrics.fid < 100
              ? 'good'
              : metrics.fid < 300
                ? 'needs_improvement'
                : 'poor'
            : 'unknown';
        const clsRating =
          metrics.cls !== undefined
            ? metrics.cls < 0.1
              ? 'good'
              : metrics.cls < 0.25
                ? 'needs_improvement'
                : 'poor'
            : 'unknown';

        window.posthog?.capture('page_performance', {
          ...metrics,
          lcp_rating: lcpRating,
          fid_rating: fidRating,
          cls_rating: clsRating,
          page_path: window.location.pathname,
          connection_type:
            (navigator as Navigator & { connection?: { effectiveType?: string } }).connection
              ?.effectiveType || 'unknown',
        });
      }
    }, 3000);
  });
}

// Auto-initialize if this script is loaded directly
if (typeof window !== 'undefined') {
  initEnhancedAnalytics();
}
