/**
 * Global search index, built at build time and served as /search-index.json.
 * SearchDialog fetches it the first time someone opens search, so it no longer
 * ships inline in every page (it was ~80 KB of HTML per page).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection } from 'astro:content';
import { participantUrl } from '@lib/participant-identity';
import { glossaryData, glossaryAnchor } from '@lib/glossary';
import { roleLabels } from '@lib/taxonomy';
import { V22_DEADLINE } from '@lib/v22-deadline';

export interface SearchItem {
  type: 'participant' | 'news' | 'page' | 'resource';
  title: string;
  description?: string;
  url: string;
  meta?: string;
  searchTerms?: string[];
}

export async function buildSearchIndex() {
  // Load profiles for city data (used by both production and sandbox)
  const profilesPath = join(process.cwd(), 'data/participants/profiles.json');
  let profiles: Record<string, any> = {};
  try {
    profiles = JSON.parse(readFileSync(profilesPath, 'utf-8'));
  } catch {
    // Profiles are optional
  }

  // Load production participant data at build time
  let productionParticipants: Array<{
    id: string;
    name: string;
    shortName: string;
    city: string;
    roles: string[];
  }> = [];

  try {
    const snapshotPath = join(process.cwd(), 'data/observatory/snapshots/production/latest.json');
    const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf-8'));
    const participantData = snapshot.participants || [];

    productionParticipants = participantData.map((p: any) => {
      const profile = profiles[p.name] || profiles[p.shortName] || null;
      const city =
        p.city === 'Unknown' && profile?.headquarters?.city ? profile.headquarters.city : p.city;

      return {
        id: p.id,
        name: p.name,
        shortName: p.shortName || p.name,
        city: city || 'UAE',
        roles: p.roles || [],
      };
    });
  } catch (error) {
    console.warn('Could not load production participant data for search:', error);
  }

  // Load sandbox participant data at build time
  let sandboxParticipants: Array<{
    id: string;
    name: string;
    shortName: string;
    city: string;
    roles: string[];
  }> = [];

  try {
    const snapshotPath = join(process.cwd(), 'data/observatory/snapshots/sandbox/latest.json');
    const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf-8'));
    const participantData = snapshot.participants || [];

    // Get production registration IDs to filter out duplicates
    const productionIds = new Set(productionParticipants.map((p) => p.id));

    sandboxParticipants = participantData
      .filter((p: any) => !productionIds.has(p.id)) // Exclude those already in production
      .map((p: any) => {
        const profile = profiles[p.name] || profiles[p.shortName] || null;
        const city =
          p.city === 'Unknown' && profile?.headquarters?.city ? profile.headquarters.city : p.city;

        return {
          id: p.id,
          name: p.name,
          shortName: p.shortName || p.name,
          city: city || 'UAE',
          roles: p.roles || [],
        };
      });
  } catch (error) {
    console.warn('Could not load sandbox participant data for search:', error);
  }

  // Load news articles at build time
  let newsArticles: Array<{
    title: string;
    slug: string;
    type: string;
  }> = [];

  try {
    const allNews = await getCollection('news');
    newsArticles = allNews.map((article) => ({
      title: article.data.title,
      slug: article.id,
      type: article.data.type || 'news',
    }));
  } catch (error) {
    console.warn('Could not load news for search:', error);
  }

  // Load commons contributions at build time
  let commonsItems: Array<{
    title: string;
    slug: string;
    type: string;
    summary: string;
    useCases: string[];
  }> = [];

  try {
    const allCommons = await getCollection('commons', ({ data }) => !data.draft);
    commonsItems = allCommons.map((item) => ({
      title: item.data.title,
      slug: item.id,
      type: item.data.type || 'resource',
      summary: item.data.summary,
      useCases: item.data.useCases,
    }));
  } catch (error) {
    console.warn('Could not load commons for search:', error);
  }

  return {
    concepts: [
      ...glossaryData.flatMap((section) =>
        section.terms.map((term) => ({
          type: 'page' as const,
          title: `${term.term}${term.full ? ` — ${term.full}` : ''}`,
          description: term.definition,
          url: `/learn/glossary#${glossaryAnchor(term.term)}`,
          searchTerms: [term.term, term.full || '', term.definition],
        }))
      ),
      {
        type: 'page' as const,
        title: V22_DEADLINE.title,
        description: V22_DEADLINE.searchDescription,
        url: V22_DEADLINE.path,
        searchTerms: [V22_DEADLINE.title, V22_DEADLINE.searchDescription, 'V2.2', 'deadline'],
      },
    ],
    participants: [
      // Production participants
      ...productionParticipants.map((p) => ({
        type: 'participant' as const,
        title: p.name,
        description: p.roles.join(', '),
        meta: `${p.city} • Production • ${p.id.slice(0, 8)}`,
        url: participantUrl(p),
        searchTerms: [
          p.name.toLowerCase(),
          p.shortName?.toLowerCase(),
          ...p.roles.flatMap((r) => [r.toLowerCase(), roleLabels[r]?.toLowerCase() || r]),
          p.id,
        ].filter(Boolean),
      })),
      // Sandbox-only participants
      ...sandboxParticipants.map((p) => ({
        type: 'participant' as const,
        title: p.name,
        description: p.roles.join(', '),
        meta: `${p.city} • Sandbox • ${p.id.slice(0, 8)}`,
        url: participantUrl(p, 'sandbox'),
        searchTerms: [
          p.name.toLowerCase(),
          p.shortName?.toLowerCase(),
          ...p.roles.flatMap((r) => [r.toLowerCase(), roleLabels[r]?.toLowerCase() || r]),
          p.id,
        ].filter(Boolean),
      })),
    ],
    news: newsArticles.map((n) => ({
      type: 'news' as const,
      title: n.title,
      meta: n.type,
      url: `/news/${n.slug}`,
      searchTerms: [n.title.toLowerCase()],
    })),
    commons: commonsItems.map((c) => ({
      type: 'resource' as const,
      title: c.title,
      description: c.summary,
      meta: c.type,
      url: `/commons/${c.slug}`,
      searchTerms: [
        c.title.toLowerCase(),
        c.summary.toLowerCase(),
        c.slug.replace(/-/g, ' '),
        ...c.useCases,
      ],
    })),
  };
}
