import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { newsCardPath, ogCardPath } from '../og-cards';

const publicDir = join(process.cwd(), 'public');
const newsIds = readdirSync(join(process.cwd(), 'src/content/news')).map((f) =>
  f.replace(/\.mdx?$/, '')
);

describe('social cards', () => {
  it('maps page paths to card files', () => {
    expect(ogCardPath('/')).toBe('og/pages/home.png');
    expect(ogCardPath('/learn/tpp-guide/')).toBe('og/pages/learn--tpp-guide.png');
    expect(newsCardPath('2026-01-01-x')).toBe('og/news/2026-01-01-x.png');
  });

  it('has a card for each main section', () => {
    for (const path of ['/observatory/', '/learn/', '/news/', '/data-sandbox/', '/global/']) {
      expect(existsSync(join(publicDir, ogCardPath(path))), path).toBe(true);
    }
  });

  it('keeps no news cards for articles that no longer exist', () => {
    const cards = readdirSync(join(publicDir, 'og/news')).map((f) => f.replace(/\.png$/, ''));
    expect(cards.filter((id) => !newsIds.includes(id))).toEqual([]);
  });
});
