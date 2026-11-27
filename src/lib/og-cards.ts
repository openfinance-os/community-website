/**
 * Where generated social cards live (scripts/generate-page-og.ts writes them).
 * Paths are relative to public/, without a leading slash.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export function ogCardPath(pathname: string): string {
  const slug = pathname.replace(/^\/+|\/+$/g, '').replace(/\//g, '--') || 'home';
  return `og/pages/${slug}.png`;
}

export function newsCardPath(id: string): string {
  return `og/news/${id}.png`;
}

/** The card's URL path when the file exists in public/, otherwise undefined. */
export function existingCard(relative: string): string | undefined {
  return existsSync(join(process.cwd(), 'public', relative)) ? `/${relative}` : undefined;
}
