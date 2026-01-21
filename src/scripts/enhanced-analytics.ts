/**
 * Enhanced PostHog Analytics
 *
 * Provides advanced tracking capabilities:
 * - UTM parameter capture & marketing attribution
 * - Scroll depth tracking
 * - Engagement time tracking
 * - Outbound link tracking
 * - Return visitor identification
 * - Page performance metrics (Core Web Vitals)
 */

// Types are declared in analytics.ts

/**
 * Initialize all enhanced analytics features
 * Should be called once per page load
 */
export function initEnhancedAnalytics(): void {
  if (typeof window === 'undefined') return;
  if (window.__enhancedAnalyticsInitialized) return;
  window.__enhancedAnalyticsInitialized = true;

  // Wait for PostHog to be ready
  const initWhenReady = () => {
    if (window.posthog) {
      captureUTMParameters();
      captureReferrer();
      identifyReturningVisitor();
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
// Return Visitor Identification
// ============================================

function identifyReturningVisitor(): void {
  const visitorKey = 'ofos_visitor_id';
  const visitCountKey = 'ofos_visit_count';
  const firstVisitKey = 'ofos_first_visit';
  const lastVisitKey = 'ofos_last_visit';

  let visitorId = localStorage.getItem(visitorKey);
  let visitCount = parseInt(localStorage.getItem(visitCountKey) || '0', 10);
  const firstVisit = localStorage.getItem(firstVisitKey);
  const lastVisit = localStorage.getItem(lastVisitKey);
  const now = new Date().toISOString();

  // Check if this is a new session (more than 30 min since last visit)
  const isNewSession = !lastVisit || Date.now() - new Date(lastVisit).getTime() > 30 * 60 * 1000;

  if (!visitorId) {
    // New visitor
    visitorId = generateVisitorId();
    localStorage.setItem(visitorKey, visitorId);
    localStorage.setItem(firstVisitKey, now);
    localStorage.setItem(visitCountKey, '1');
    localStorage.setItem(lastVisitKey, now);

    window.posthog?.capture('new_visitor', {
      visitor_id: visitorId,
    });

    window.posthog?.register({
      visitor_type: 'new',
      visit_count: 1,
    });
  } else if (isNewSession) {
    // Returning visitor, new session
    visitCount += 1;
    localStorage.setItem(visitCountKey, visitCount.toString());
    localStorage.setItem(lastVisitKey, now);

    const daysSinceFirstVisit = firstVisit
      ? Math.floor((Date.now() - new Date(firstVisit).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    window.posthog?.capture('returning_visitor', {
      visitor_id: visitorId,
      visit_count: visitCount,
      days_since_first_visit: daysSinceFirstVisit,
    });

    window.posthog?.register({
      visitor_type: 'returning',
      visit_count: visitCount,
      days_since_first_visit: daysSinceFirstVisit,
    });
  } else {
    // Same session, just update last visit
    localStorage.setItem(lastVisitKey, now);

    window.posthog?.register({
      visitor_type: visitCount === 1 ? 'new' : 'returning',
      visit_count: visitCount,
    });
  }
}

function generateVisitorId(): string {
  return 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
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
  const currentHost = window.location.hostname;

  document.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    try {
      const url = new URL(href, window.location.origin);

      // Check if it's an external link
      if (url.hostname && url.hostname !== currentHost) {
        window.posthog?.capture('outbound_link_clicked', {
          url: href,
          domain: url.hostname,
          link_text: link.textContent?.trim().substring(0, 100) || '',
          link_location: getLinkLocation(link),
          page_path: window.location.pathname,
        });
      }
    } catch {
      // Invalid URL, ignore
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
