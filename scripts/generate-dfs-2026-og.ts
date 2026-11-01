/**
 * Rasterise the Dubai FinTech Summit cover for social cards.
 * Regenerate with `npx tsx scripts/generate-dfs-2026-og.ts` (Chromium required).
 * The in-page figure stays the SVG. The PNG is 1200×630 so og:image width and height match.
 */
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataURL = (path: string, type: string) =>
  `data:${type};base64,${readFileSync(join(root, 'public', path)).toString('base64')}`;

const cover = readFileSync(join(root, 'public/news/dfs-2026/cover.svg'), 'utf8');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Dubai FinTech Summit social card</title>
  <style>
    @font-face { font-family: 'DM Sans'; font-weight: 400; src: url('${dataURL('fonts/dm-sans-regular.ttf', 'font/ttf')}'); }
    @font-face { font-family: 'DM Sans'; font-weight: 500; src: url('${dataURL('fonts/dm-sans-medium.ttf', 'font/ttf')}'); }
    @font-face { font-family: 'DM Sans'; font-weight: 600; src: url('${dataURL('fonts/dm-sans-semibold.ttf', 'font/ttf')}'); }
    * { box-sizing: border-box; }
    body { margin: 0; background: #F6F8F5; }
    svg { width: 1200px; height: 630px; display: block; }
  </style>
</head>
<body>
  ${cover}
</body>
</html>`;

const executablePath = process.env.CHROMIUM_PATH || '/usr/local/bin/chrome';
const browser = await chromium.launch({ executablePath });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(html);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  const overflow = await page.evaluate(() => {
    const svg = document.querySelector('svg')!;
    const view = svg.viewBox.baseVal;
    return [...svg.querySelectorAll('text')].flatMap((node) => {
      const box = node.getBBox();
      const text = node.textContent?.trim() ?? '';
      const outside =
        box.x < 8 ||
        box.y < 4 ||
        box.x + box.width > view.width - 8 ||
        box.y + box.height > view.height - 8;
      return outside ? [{ text, x: box.x, y: box.y, w: box.width, h: box.height }] : [];
    });
  });
  if (overflow.length) {
    throw new Error(`Cover text leaves the viewBox: ${JSON.stringify(overflow)}`);
  }
  await page.evaluate(() => {
    for (const element of document.querySelectorAll('svg text')) {
      const box = element.getBoundingClientRect();
      if (box.left < 285 || box.right > 915 || box.top < 32 || box.bottom > 598) {
        throw new Error(
          `Social-card text extends beyond the crop-safe area: ${element.textContent?.trim()} (${Math.round(box.left)},${Math.round(box.top)}–${Math.round(box.right)},${Math.round(box.bottom)})`
        );
      }
    }
  });
  await page.screenshot({
    path: join(root, 'public/news/dfs-2026/cover.png'),
    type: 'png',
  });
  console.log('Generated public/news/dfs-2026/cover.png (1200×630).');
} finally {
  await browser.close();
}
