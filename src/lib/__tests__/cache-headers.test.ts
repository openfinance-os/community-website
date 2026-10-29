import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const headers = readFileSync(new URL('../../../public/_headers', import.meta.url), 'utf8');

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
});
