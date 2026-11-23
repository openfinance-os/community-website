/**
 * Public dataset: the latest production-registry snapshot — summary
 * statistics and the full participant list (roles, API families, live
 * status) exactly as observed from the public trust-framework directory.
 * Stable URL: /observatory/data/registry-latest.json
 */
import type { APIRoute } from 'astro';
import { registryDefinitions } from '@lib/registry-definitions';
import latest from '../../../../data/observatory/snapshots/production/latest.json';

export const GET: APIRoute = () => {
  const body = {
    dataset: 'uae-open-finance-registry-latest',
    description:
      'The most recent production-registry snapshot: summary statistics and the full participant list (roles, API families, published authorization-server metadata) from the public trust-framework directory.',
    source: 'https://data.directory.openfinance.ae',
    environment: 'production',
    observedAt: latest.timestamp,
    schemaVersion: latest.version,
    definitions: registryDefinitions,
    license: 'CC-BY-4.0',
    attribution: 'Open Finance OS (openfinance-os.org) — independent, not official',
    summary: latest.summary,
    participants: latest.participants,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
