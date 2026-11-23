/**
 * Public dataset: the full production-registry changelog, derived by
 * diffing the daily trust-framework directory snapshots.
 * Stable URL: /observatory/data/registry-changelog.json
 */
import type { APIRoute } from 'astro';
import { registryDefinitions } from '@lib/registry-definitions';
import { getRegistryChangelog, getTrackingSince } from '@lib/registry-changelog';

export const GET: APIRoute = () => {
  const events = getRegistryChangelog();
  const body = {
    dataset: 'uae-open-finance-registry-changelog',
    description:
      'Dated changes to production registrations, issuer publication, roles, families and resource declarations, derived by diffing saved directory snapshots.',
    source: 'https://data.directory.openfinance.ae',
    trackingSince: getTrackingSince(),
    definitions: registryDefinitions,
    license: 'CC-BY-4.0',
    attribution: 'Open Finance OS (openfinance-os.org) — independent, not official',
    note: 'Event dates are later-snapshot observation dates and can lag real-world changes. The 2026-10-08 collector schema 2.1 update expanded family coverage; additions on that date can reflect a measurement correction.',
    count: events.length,
    events,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
