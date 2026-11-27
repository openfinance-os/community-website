/**
 * Site search index (participants, news, commons, glossary concepts).
 * Fetched lazily by SearchDialog the first time search is opened, so it is
 * not inlined into every page. Rebuilt with the site.
 */
import type { APIRoute } from 'astro';
import { buildSearchIndex } from '@lib/search-index';

export const GET: APIRoute = async () => {
  const index = await buildSearchIndex();
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
