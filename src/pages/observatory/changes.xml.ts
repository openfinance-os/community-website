/**
 * RSS feed of dated directory changes, one item per environment and
 * observation date. Built from the same changelog as the JSON datasets,
 * so readers can follow changes without the site tracking them.
 * Stable URL: /observatory/changes.xml
 */
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getRegistryChangelog, type ChangelogEvent } from '@lib/registry-changelog';
import { registryEventLabels, resourceChangePresentation } from '@lib/registry-event-presentation';
import { apiFamilyLabel, roleLabels } from '@lib/taxonomy';

const MAX_ITEMS = 60;

function eventLine(event: ChangelogEvent): string {
  const label = registryEventLabels[event.type].label;
  let detail = '';
  if (event.type === 'resource_changed' && event.detail) {
    detail = resourceChangePresentation(event.detail)?.summary ?? '';
  } else if (event.detail && /api_family/.test(event.type)) {
    detail = event.detail
      .split(' · ')
      .map((family) => apiFamilyLabel(family.trim()))
      .join(', ');
  } else if (event.detail) {
    detail = event.detail
      .split(' · ')
      .map((role) => roleLabels[role.trim()] ?? role.trim())
      .join(', ');
  }
  return `${event.name}: ${label}${detail ? ` (${detail})` : ''}`;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function GET(context: APIContext) {
  const site = context.site?.toString() || 'https://openfinance-os.org/';
  const environments = [
    { key: 'production' as const, name: 'Production', page: '/observatory/#changelog' },
    { key: 'sandbox' as const, name: 'Sandbox', page: '/observatory/sandbox/' },
  ];

  const items = environments.flatMap((environment) => {
    const byDate = new Map<string, ChangelogEvent[]>();
    for (const event of getRegistryChangelog(environment.key)) {
      byDate.set(event.date, [...(byDate.get(event.date) ?? []), event]);
    }
    return [...byDate.entries()].map(([date, events]) => {
      const longDate = new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      });
      const count = `${events.length} change${events.length === 1 ? '' : 's'}`;
      const lines = events.map(eventLine);
      return {
        title: `${environment.name} directory: ${count} observed ${longDate}`,
        pubDate: new Date(`${date}T00:00:00Z`),
        link: environment.page,
        customData: `<guid isPermaLink="false">openfinance-os:changes:${environment.key}:${date}</guid>`,
        description: lines.join('; '),
        content: `<ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul><p>Dates are when a daily snapshot of the public directory first saw the change. Registrations and published metadata are not traffic or operational status.</p>`,
      };
    });
  });

  items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: 'Open Finance OS: UAE directory changes',
    description:
      'Dated changes to registrations, roles, API families and resource declarations in the public UAE Open Finance directory, production and sandbox, newest first.',
    site,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>en-us</language><atom:link href="${new URL('observatory/changes.xml', site).toString()}" rel="self" type="application/rss+xml"/>`,
    items: items.slice(0, MAX_ITEMS),
  });
}
