import type { APIRoute } from 'astro';
import { getRegistryChangelog, getTrackingSince } from '@lib/registry-changelog';
import { registryDefinitions } from '@lib/registry-definitions';
export const GET: APIRoute = () => {
  const events = getRegistryChangelog('sandbox');
  return new Response(
    JSON.stringify(
      {
        dataset: 'uae-open-finance-sandbox-registry-changelog',
        environment: 'sandbox',
        source: 'https://data.sandbox.directory.openfinance.ae',
        trackingSince: getTrackingSince('sandbox'),
        definitions: registryDefinitions,
        count: events.length,
        events,
        note: 'Dates are later-snapshot observation dates, not deployment dates. Fields can change because collection coverage changes. The 2026-10-08 schema 2.1 update expanded resource-family coverage.',
        attribution: 'Open Finance OS — independent observations, not official statistics',
      },
      null,
      2
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
};
