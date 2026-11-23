import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('default social card', () => {
  it('declares 1200x630 and matches the committed PNG', () => {
    const layout = readFileSync('src/layouts/BaseLayout.astro', 'utf8');
    const png = readFileSync('public/og-image.png');
    expect(layout).toContain('ogImageWidth = 1200');
    expect(layout).toContain('ogImageHeight = 630');
    expect(layout).toContain("name: 'Open Finance OS'");
    expect(layout).not.toContain('OpenFinance-OS');
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
});
