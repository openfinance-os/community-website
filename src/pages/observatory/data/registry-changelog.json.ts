/**
 * Public dataset: the full production-registry changelog, derived by
 * diffing the daily trust-framework directory snapshots.
 * Stable URL: /observatory/data/registry-changelog.json
 */
import type { APIRoute } from 'astro';
import { getRegistryChangelog, getTrackingSince } from '@lib/registry-changelog';

export const GET: APIRoute = () => {
  const events = getRegistryChangelog();
  const body = {
    dataset: 'uae-open-finance-registry-changelog',
    description:
      'Dated changes to the UAE Open Finance production registry (joins, departures, go-lives, role and API-family additions), derived by diffing daily snapshots of the public trust-framework directory.',
    source: 'https://data.directory.openfinance.ae',
    trackingSince: getTrackingSince(),
    license: 'CC-BY-4.0',
    attribution: 'OpenFinance-OS (openfinance-os.org) — independent, not official',
    note: 'Event dates are observation dates (the later snapshot of each diffed pair) and may lag the real-world change.',
    count: events.length,
    events,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
