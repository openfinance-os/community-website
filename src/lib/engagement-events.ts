/** Public destination metadata describes an attempt, never successful retrieval or reading. */
export function outboundAttempt(href: string, currentUrl: string) {
  try {
    if (!href.trim()) return null;
    const current = new URL(currentUrl);
    const destination = new URL(href, current);
    if (!['https:', 'http:'].includes(destination.protocol)) return null;
    if (destination.username || destination.password) return null;
    const firstPartyHosts = new Set([
      current.hostname,
      'openfinance-os.org',
      'www.openfinance-os.org',
    ]);
    if (firstPartyHosts.has(destination.hostname)) return null;
    return {
      action: 'navigation_attempt' as const,
      measurement_version: 2,
      destination_host: destination.hostname,
      destination_path: destination.pathname.slice(0, 250),
      // Retain the existing hostname field for consumers of the main-site events.
      domain: destination.hostname,
    };
  } catch {
    return null;
  }
}
