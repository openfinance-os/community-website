import { describe, expect, it } from 'vitest';
import { outboundAttempt } from '../engagement-events';

const current = 'https://openfinance-os.org/learn/';

describe('outbound navigation attempt contract', () => {
  it('retains public destination metadata without query, fragment, link text or completion claims', () => {
    expect(
      outboundAttempt('https://example.org/docs?email=private&token=secret#private', current)
    ).toEqual({
      action: 'navigation_attempt',
      measurement_version: 2,
      destination_host: 'example.org',
      destination_path: '/docs',
      domain: 'example.org',
    });
  });

  it.each([
    '',
    '/commons/data-sandbox',
    'https://www.openfinance-os.org/learn/',
    'https://user:password@example.org/',
    'javascript:alert(1)',
    'mailto:private@example.org',
    'data:text/plain,private',
    'https://[invalid',
  ])('does not emit an outbound attempt for %s', (href) => {
    expect(outboundAttempt(href, current)).toBeNull();
  });

  it('recognizes cross-host sandbox navigation as an attempt and bounds its path', () => {
    const attempt = outboundAttempt(
      `https://demoapp.openfinance-os.org/${'a'.repeat(300)}`,
      current
    )!;
    expect(attempt.action).toBe('navigation_attempt');
    expect(attempt.destination_host).toBe('demoapp.openfinance-os.org');
    expect(attempt.destination_path).toHaveLength(250);
  });
});
