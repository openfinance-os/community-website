// Shared production bootstrap for Astro pages and the standalone Watcher.
// The project token is public. Keep reporting/query credentials out of this file.
(function () {
  if (!['openfinance-os.org', 'www.openfinance-os.org'].includes(window.location.hostname)) return;
  window.__analyticsInitialized = window.__analyticsInitialized || {};
  if (window.__analyticsInitialized.productionPostHog) return;
  window.__analyticsInitialized.productionPostHog = true;
  const isWatcher = /^\/observatory\/watch\/?$/.test(window.location.pathname);
  !(function (t, e) {
    var o, n, p, r;
    e.__SV ||
      (window.posthog && window.posthog.__loaded) ||
      ((window.posthog = e),
      (e._i = []),
      (e.init = function (i, s, a) {
        function g(t, e) {
          var o = e.split('.');
          (2 == o.length && ((t = t[o[0]]), (e = o[1])),
            (t[e] = function () {
              t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
            }));
        }
        (((p = t.createElement('script')).type = 'text/javascript'),
          (p.crossOrigin = 'anonymous'),
          (p.async = !0),
          (p.src =
            s.api_host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js'),
          (r = t.getElementsByTagName('script')[0]).parentNode.insertBefore(p, r));
        var u = e;
        for (
          void 0 !== a ? (u = e[a] = []) : (a = 'posthog'),
            u.people = u.people || [],
            u.toString = function (t) {
              var e = 'posthog';
              return ('posthog' !== a && (e += '.' + a), t || (e += ' (stub)'), e);
            },
            u.people.toString = function () {
              return u.toString(1) + '.people (stub)';
            },
            o =
              'init Xr es pi Zr rs Kr Qr capture Ni calculateEventProperties os register register_once register_for_session unregister unregister_for_session ds getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty us ns createPersonProfile hs Vr vs opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing ss debug O ls getPageViewId captureTraceFeedback captureTraceMetric qr'.split(
                ' '
              ),
            n = 0;
          n < o.length;
          n++
        )
          g(u, o[n]);
        e._i.push([i, s, a]);
      }),
      (e.__SV = 1));
  })(document, window.posthog || []);
  posthog.init('phc_D5a06AlAIDy5EjIXmlLjhQMIAtBNfdtNyoybsJD3Ewv', {
    api_host: 'https://us.i.posthog.com',
    defaults: '2025-11-30',
    person_profiles: 'identified_only',
    ...(isWatcher
      ? {
          capture_pageview: true,
          capture_pageleave: true,
          autocapture: false,
          disable_session_recording: true,
        }
      : {}),
  });

  if (!isWatcher) return;
  // Only explicit public navigation events; no free text, payload data or replay.
  document.addEventListener('click', function (event) {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (link.closest('.nav') && /^#[a-z0-9_-]{1,64}$/i.test(href || '')) {
      const section = href.slice(1);
      if (document.getElementById(section)) {
        window.posthog.capture('watch_section_selected', {
          section,
          action: 'section_request',
          measurement_version: 2,
        });
      }
      return;
    }
    if (!href || event.defaultPrevented) return;
    try {
      const url = new URL(href, window.location.href);
      if (!['https:', 'http:'].includes(url.protocol)) return;
      if (url.username || url.password) return;
      if (['openfinance-os.org', 'www.openfinance-os.org'].includes(url.hostname)) return;
      window.posthog.capture('watch_source_opened', {
        action: 'navigation_attempt',
        measurement_version: 2,
        destination_host: url.hostname,
        destination_path: url.pathname.slice(0, 250),
      });
    } catch {
      /* Invalid links must never disrupt navigation. */
    }
  });
})();
