import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { includeInSitemap, loadNewsLastModified } from '../sitemap-pages.mjs';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('includeInSitemap', () => {
  it('keeps news posts and ordinary pages', () => {
    expect(
      includeInSitemap('https://openfinance-os.org/news/2026-10-28-zencom-and-mastercard/')
    ).toBe(true);
    expect(includeInSitemap('https://openfinance-os.org/updates/')).toBe(true);
    expect(includeInSitemap('https://openfinance-os.org/newsletter/')).toBe(true);
    expect(includeInSitemap('https://openfinance-os.org/newsletter')).toBe(true);
    expect(includeInSitemap('https://openfinance-os.org/observatory/participant/abc/')).toBe(true);
  });

  it('drops the news index, the 404, JSON endpoints, github, and the noindex welcome page', () => {
    expect(includeInSitemap('https://openfinance-os.org/news/')).toBe(false);
    expect(includeInSitemap('https://openfinance-os.org/news')).toBe(false);
    expect(includeInSitemap('https://openfinance-os.org/404/')).toBe(false);
    expect(includeInSitemap('https://openfinance-os.org/404.html')).toBe(false);
    expect(
      includeInSitemap('https://openfinance-os.org/observatory/data/registry-latest.json')
    ).toBe(false);
    expect(includeInSitemap('https://openfinance-os.org/github/')).toBe(false);
    expect(includeInSitemap('https://openfinance-os.org/newsletter/welcome/')).toBe(false);
    expect(includeInSitemap('https://openfinance-os.org/newsletter/welcome')).toBe(false);
    expect(includeInSitemap('https://openfinance-os.org/newsletter/welcome/index.html')).toBe(
      false
    );
  });
});

describe('loadNewsLastModified', () => {
  it('reads publication dates from news frontmatter', () => {
    const dir = mkdtempSync(join(tmpdir(), 'news-'));
    tempDirs.push(dir);
    writeFileSync(
      join(dir, '2026-10-28-example.md'),
      '---\ntitle: Example\ndate: 2026-10-28\ntype: global\n---\n\nBody\n'
    );
    const dates = loadNewsLastModified(dir);
    expect(dates.get('/news/2026-10-28-example/')).toBe('2026-10-28');
  });
});
