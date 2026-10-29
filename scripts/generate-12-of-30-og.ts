/**
 * Rasterise the 12-of-30 hero for social cards.
 * Regenerate with `npx tsx scripts/generate-12-of-30-og.ts` (Chromium required).
 * The in-page figure stays the SVG so it follows the site theme.
 */
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataURL = (path: string, type: string) =>
  `data:${type};base64,${readFileSync(join(root, 'public', path)).toString('base64')}`;

const hero = readFileSync(join(root, 'public/news/12-of-30/hero.svg'), 'utf8');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>12 of 30 social card</title>
  <style>
    @font-face { font-family: 'DM Sans'; font-weight: 400; src: url('${dataURL('fonts/dm-sans-regular.ttf', 'font/ttf')}'); }
    @font-face { font-family: 'DM Sans'; font-weight: 500; src: url('${dataURL('fonts/dm-sans-medium.ttf', 'font/ttf')}'); }
    :root {
      --color-card: #ffffff;
      --color-text: #132c2b;
      --color-text-secondary: #526662;
      --color-brand-ink: #0d4f4f;
      --color-soft: #e7efea;
      --color-surface: #f6f8f5;
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f6f8f5; }
    main {
      width: 1200px;
      height: 630px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    svg {
      width: 600px;
      height: auto;
      display: block;
      border: 1px solid #dce5df;
      border-radius: 16px;
    }
  </style>
</head>
<body>
  <main>${hero}</main>
</body>
</html>`;

const browser = await chromium.launch();
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
    throw new Error(`Hero text leaves the viewBox: ${JSON.stringify(overflow)}`);
  }
  await page.evaluate(() => {
    for (const element of document.querySelectorAll('svg text')) {
      const box = element.getBoundingClientRect();
      if (box.left < 285 || box.right > 915 || box.top < 32 || box.bottom > 598) {
        throw new Error(
          `Social-card text extends beyond the crop-safe area: ${element.textContent}`
        );
      }
    }
  });
  await page.screenshot({
    path: join(root, 'public/news/12-of-30/hero.png'),
    type: 'png',
  });
  console.log('Generated public/news/12-of-30/hero.png (1200×630).');
} finally {
  await browser.close();
}
