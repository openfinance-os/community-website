/**
 * Rasterise the V2.2 deadline social card.
 * Regenerate with `npx tsx scripts/generate-v22-deadline-og.ts`.
 * Uses the brand lockup at brand/logo-full.svg and DM Sans from public/fonts.
 */
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { V22_DEADLINE } from '../src/lib/v22-deadline.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataURL = (path: string, type: string) =>
  `data:${type};base64,${readFileSync(join(root, path)).toString('base64')}`;

const logo = dataURL('brand/logo-full.svg', 'image/svg+xml');
const regular = dataURL('public/fonts/dm-sans-regular.ttf', 'font/ttf');
const medium = dataURL('public/fonts/dm-sans-medium.ttf', 'font/ttf');
const semibold = dataURL('public/fonts/dm-sans-semibold.ttf', 'font/ttf');
const lines = V22_DEADLINE.ogLines.map((line) => `<span>${line}</span>`).join('');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${V22_DEADLINE.title}</title>
  <style>
    @font-face { font-family: 'DM Sans'; font-weight: 400; src: url('${regular}'); }
    @font-face { font-family: 'DM Sans'; font-weight: 500; src: url('${medium}'); }
    @font-face { font-family: 'DM Sans'; font-weight: 600; src: url('${semibold}'); }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f6f8f5; }
    main {
      width: 1200px;
      height: 630px;
      display: flex;
      flex-direction: column;
      padding: 48px 72px 40px;
      border-top: 14px solid #E8A85C;
      background: #f6f8f5;
      color: #0D4F4F;
      font-family: 'DM Sans', sans-serif;
    }
    img { width: 320px; height: auto; }
    p { margin: 28px 0 0; color: #526662; font-size: 18px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; }
    h1 { margin: 18px 0 0; max-width: 980px; color: #0D4F4F; font-size: 64px; font-weight: 600; line-height: 1.05; letter-spacing: -1.5px; }
    h1 span { display: block; }
    .subtitle { margin-top: 28px; color: #3d524c; font-size: 28px; font-weight: 400; letter-spacing: 0; text-transform: none; line-height: 1.35; }
    footer { margin-top: auto; color: #526662; font-size: 22px; }
  </style>
</head>
<body>
  <main>
    <img src="${logo}" alt="Open Finance OS">
    <p>${V22_DEADLINE.sourceLabel}</p>
    <h1>${lines}</h1>
    <p class="subtitle">${V22_DEADLINE.ogSubtitle}</p>
    <footer>openfinance-os.org</footer>
  </main>
</body>
</html>`;

const output = join(root, 'public', V22_DEADLINE.ogPath.replace(/^\//, ''));
mkdirSync(dirname(output), { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(html);
  await page.evaluate(async () => {
    await document.fonts.ready;
    const loaded = document.fonts.check('600 64px "DM Sans"');
    if (!loaded) throw new Error('DM Sans did not load');
    await document.querySelector('img')!.decode();
    const main = document.querySelector('main')!;
    if (main.scrollHeight > 630 || main.scrollWidth > 1200) {
      throw new Error(`Social card overflow: ${main.scrollWidth}x${main.scrollHeight}`);
    }
  });
  await page.screenshot({ path: output, type: 'png' });
  console.log(`Generated ${V22_DEADLINE.ogPath} (1200×630).`);
} finally {
  await browser.close();
}
