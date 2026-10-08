import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';
import { GET } from '../../pages/observatory/watch/index.html';

const bootstrap = readFileSync('public/analytics/posthog.js', 'utf8');

function browser(host = 'openfinance-os.org', path = '/observatory/watch/') {
  const listeners: Record<string, (event: unknown) => void> = {};
  const scripts: unknown[] = [];
  class Element {}
  const globals: Record<string, any> = {
    Element,
    URL,
    location: { hostname: host, pathname: path, href: `https://${host}${path}` },
    document: {
      createElement: () => ({}),
      getElementsByTagName: () => [
        { parentNode: { insertBefore: (script: unknown) => scripts.push(script) } },
      ],
      addEventListener: (type: string, handler: (event: unknown) => void) => {
        listeners[type] = handler;
      },
      getElementById: (id: string) => (id === 'operations' ? {} : null),
    },
  };
  globals.window = globals;
  const context = vm.createContext(globals);
  const run = () => vm.runInContext(bootstrap, context);
  const click = (href: string, nav = false, defaultPrevented = false) => {
    const target = new Element() as Element & { closest: () => unknown };
    target.closest = () => ({ getAttribute: () => href, closest: () => nav });
    listeners.click?.({ target, defaultPrevented });
  };
  return { globals, scripts, run, click };
}

describe('standalone Watcher analytics', () => {
  it('is included by the rendered endpoint with its canonical URL', async () => {
    const response = (GET as () => Response)();
    const html = await response.text();
    expect(html).toContain('<script src="/analytics/posthog.js"></script>');
    expect(html).toContain('href="https://openfinance-os.org/observatory/watch/"');
    expect(html).not.toContain('__DATA__');
  });

  it.each(['localhost', 'preview.pages.dev', 'demoapp.openfinance-os.org'])(
    'does not load analytics on %s',
    (host) => {
      const b = browser(host);
      b.run();
      expect(b.scripts).toHaveLength(0);
      expect(b.globals.posthog).toBeUndefined();
    }
  );

  it('loads the existing US project once with page events and no Watcher replay/autocapture', () => {
    const b = browser();
    b.run();
    b.run();
    expect(b.scripts).toHaveLength(1);
    expect(b.globals.posthog._i).toHaveLength(1);
    expect(b.globals.posthog._i[0][1]).toMatchObject({
      api_host: 'https://us.i.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false,
      disable_session_recording: true,
    });
  });

  it('preserves the existing main-site configuration and avoids Watcher handlers there', () => {
    const b = browser('openfinance-os.org', '/learn/');
    b.run();
    expect(b.globals.posthog._i[0][1]).toEqual({
      api_host: 'https://us.i.posthog.com',
      defaults: '2025-11-30',
      person_profiles: 'identified_only',
    });
    b.click('https://example.org/');
    expect(b.globals.posthog).toHaveLength(0);
  });

  it('tracks existing section selection and strips query strings from outbound sources', () => {
    const b = browser();
    b.run();
    b.click('#operations', true);
    b.click('#unknown', true);
    b.click('https://example.org/reference?email=private&token=secret#private');
    b.click('mailto:private@example.org');
    expect(JSON.parse(JSON.stringify(b.globals.posthog))).toEqual([
      [
        'capture',
        'watch_section_selected',
        {
          section: 'operations',
          action: 'section_request',
          measurement_version: 2,
        },
      ],
      [
        'capture',
        'watch_source_opened',
        {
          destination_host: 'example.org',
          destination_path: '/reference',
          action: 'navigation_attempt',
          measurement_version: 2,
        },
      ],
    ]);
  });

  it('ignores cancelled, credential-bearing and first-party source links', () => {
    const b = browser();
    b.run();
    b.click('https://example.org/', false, true);
    b.click('https://user:password@example.org/');
    b.click('https://www.openfinance-os.org/learn/');
    b.click('');
    expect(b.globals.posthog).toHaveLength(0);
  });
});
