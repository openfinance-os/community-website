import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const headers = readFileSync(new URL('../../../public/_headers', import.meta.url), 'utf8');

interface AttachedHeader {
  detach?: string;
  name?: string;
  value?: string;
}

interface HeaderRule {
  path: string;
  headers: AttachedHeader[];
}

/** Pages joins every matching rule. `! Name` drops earlier values for that header. */
function resolvedHeaders(source: string, requestPath: string): Record<string, string> {
  const rules: HeaderRule[] = [];
  let current: HeaderRule | null = null;
  for (const line of source.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      current = { path: trimmed, headers: [] };
      rules.push(current);
      continue;
    }
    if (!current) continue;
    if (trimmed.startsWith('! ')) {
      current.headers.push({ detach: trimmed.slice(2).trim() });
    } else {
      const separator = trimmed.indexOf(':');
      current.headers.push({
        name: trimmed.slice(0, separator).trim(),
        value: trimmed.slice(separator + 1).trim(),
      });
    }
  }

  const values = new Map<string, string[]>();
  for (const rule of rules) {
    if (!ruleMatches(rule.path, requestPath)) continue;
    for (const header of rule.headers) {
      const key = (header.detach || header.name || '').toLowerCase();
      if (header.detach) {
        values.delete(key);
      } else if (header.name && header.value) {
        values.set(key, [...(values.get(key) || []), header.value]);
      }
    }
  }

  return Object.fromEntries([...values].map(([name, parts]) => [name, parts.join(', ')]));
}

function ruleMatches(pattern: string, requestPath: string): boolean {
  const expression = `^${pattern.split('*').map(escapeRegExp).join('.*')}$`;
  return new RegExp(expression).test(requestPath);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('Cloudflare Pages cache headers', () => {
  it('caches hashed build assets immutably', () => {
    expect(headers).toMatch(
      /\/_astro\/\*[\s\S]*?Cache-Control: public, max-age=31536000, immutable/
    );
    expect(headers).toMatch(
      /\/fonts\/\*[\s\S]*?Cache-Control: public, max-age=31536000, immutable/
    );
  });

  it('tells Cloudflare to edge-cache HTML separately from the browser', () => {
    expect(headers).toMatch(
      /\/\*[\s\S]*?Cache-Control: public, max-age=0, must-revalidate[\s\S]*?Cloudflare-CDN-Cache-Control: public, max-age=1800, stale-while-revalidate=86400/
    );
  });

  it('detaches the catch-all cache policy before setting a specific one', () => {
    for (const path of [
      '/sitemap.xml',
      '/sitemap-index.xml',
      '/sitemap-0.xml',
      '/rss.xml',
      '/robots.txt',
      '/llms.txt',
      '/_astro/PageLayout.abc123.css',
      '/fonts/dm-sans-regular.ttf',
      '/og-image.png',
      '/observatory/data/registry-latest.json',
    ]) {
      const resolved = resolvedHeaders(headers, path);
      expect(resolved['cache-control'], path).not.toContain('max-age=0, must-revalidate, public');
      expect(resolved['cache-control']?.split('public').length, path).toBe(2);
      expect(resolved['cloudflare-cdn-cache-control']?.split('public').length, path).toBe(2);
    }

    expect(resolvedHeaders(headers, '/sitemap.xml')['cache-control']).toBe('public, max-age=3600');
    expect(resolvedHeaders(headers, '/rss.xml')['cache-control']).toBe('public, max-age=3600');
    expect(resolvedHeaders(headers, '/')['cache-control']).toBe(
      'public, max-age=0, must-revalidate'
    );
    expect(resolvedHeaders(headers, '/_astro/app.css')['cache-control']).toBe(
      'public, max-age=31536000, immutable'
    );
  });
});
