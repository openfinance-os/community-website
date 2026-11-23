/**
 * Public dataset: the daily time series of the UAE Open Finance registry
 * (participant counts, live count, role/city/API-family breakdowns) plus
 * named milestones.
 * Stable URL: /observatory/data/registry-history.json
 */
import type { APIRoute } from 'astro';
import { registryDefinitions } from '@lib/registry-definitions';
import history from '../../../../data/observatory/history.json';
import { getTrackingSince } from '@lib/registry-changelog';

export const GET: APIRoute = () => {
  const body = {
    dataset: 'uae-open-finance-registry-history',
    description:
      'Daily time series of the UAE Open Finance ecosystem derived from the public trust-framework directory: total participants, published authorization-server count, and breakdowns by role, city and API family, with named milestones.',
    source: 'https://data.directory.openfinance.ae',
    trackingSince: getTrackingSince(),
    lastUpdated: history.lastUpdated,
    definitions: registryDefinitions,
    license: 'CC-BY-4.0',
    attribution: 'Open Finance OS (openfinance-os.org) — independent, not official',
    dataPoints: history.dataPoints,
    milestones: history.milestones,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
