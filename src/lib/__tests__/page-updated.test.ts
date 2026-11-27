import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Every Learn and Global page tells readers when its content last changed.
const root = new URL('../../pages/', import.meta.url).pathname;
const pages = ['learn', 'global'].flatMap((dir) =>
  readdirSync(join(root, dir))
    .filter((file) => file.endsWith('.astro') && !file.startsWith('['))
    .map((file) => join(dir, file))
);

describe('Learn and Global pages show a last-updated date', () => {
  it('finds the pages', () => {
    expect(pages.length).toBeGreaterThanOrEqual(10);
  });

  for (const page of pages) {
    it(page, () => {
      const source = readFileSync(join(root, page), 'utf8');
      const match = source.match(/<PageUpdated date="(\d{4}-\d{2}-\d{2})" \/>/);
      expect(match, `${page} needs <PageUpdated date="YYYY-MM-DD" />`).not.toBeNull();
      const date = new Date(`${match![1]}T00:00:00Z`);
      expect(Number.isNaN(date.valueOf())).toBe(false);
      expect(date.valueOf()).toBeLessThanOrEqual(Date.now());
    });
  }
});
