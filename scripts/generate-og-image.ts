/** Regenerate with `npx tsx scripts/generate-og-image.ts` (Chromium must be installed). */
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataURL = (path: string, type: string) =>
  `data:${type};base64,${readFileSync(join(root, 'public', path)).toString('base64')}`;

// v2.3's existing outlined wordmark and self-hosted fonts are the only inputs.
// Center the content inside a 630px square as well as the full 1200×630 card.
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>OpenFinance-OS social card</title>
  <style>
    @font-face { font-family: 'DM Sans'; font-weight: 400; src: url('${dataURL('fonts/dm-sans-regular.ttf', 'font/ttf')}'); }
    @font-face { font-family: 'DM Sans'; font-weight: 500; src: url('${dataURL('fonts/dm-sans-medium.ttf', 'font/ttf')}'); }
    * { box-sizing: border-box; }
    body { margin: 0; background: #F6F8F5; color: #0D4F4F; font-family: 'DM Sans', sans-serif; }
    main { width: 1200px; height: 630px; padding: 64px 0 52px; display: flex; flex-direction: column; align-items: center; text-align: center; }
    img { width: 480px; height: auto; }
    h1 { width: 600px; margin: 44px 0 24px; font-size: 80px; line-height: 1.075; font-weight: 500; letter-spacing: -2px; }
    p { width: 560px; margin: 0; color: #526662; font-size: 28px; line-height: 1.3; }
    footer { margin-top: auto; color: #526662; font-size: 24px; line-height: 1.3; }
  </style>
</head>
<body>
  <main>
    <img src="${dataURL('brand/logo-full.svg', 'image/svg+xml')}" alt="OpenFinance-OS">
    <h1>Open finance.<br>In full view.</h1>
    <p>The independent view of<br>UAE Open Finance.</p>
    <footer>openfinance-os.org</footer>
  </main>
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
    await document.querySelector('img')!.decode();
    for (const element of document.querySelectorAll('img, h1, p, footer')) {
      const box = element.getBoundingClientRect();
      if (box.left < 285 || box.right > 915 || box.top < 32 || box.bottom > 598)
        throw new Error('Social-card content extends beyond the crop-safe area');
    }
  });
  await page.screenshot({ path: join(root, 'public/og-image.png'), type: 'png' });
  console.log('Generated public/og-image.png (1200×630) from approved v2.3 assets.');
} finally {
  await browser.close();
}
