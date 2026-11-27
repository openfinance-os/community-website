/**
 * Social cards for section pages and for news articles that have no image of
 * their own. Writes public/og/pages/<path>.png and public/og/news/<id>.png.
 * BaseLayout and the news article page pick a card up when it exists and fall
 * back to /og-image.png when it does not, so a new article never breaks.
 *
 * Regenerate with `npx tsx scripts/generate-page-og.ts` (Chromium must be
 * installed; set CHROMIUM_PATH if Playwright's default is missing).
 * Pass --news-only or --pages-only to limit the run.
 */
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ogCardPath } from '../src/lib/og-cards';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataURL = (path: string, type: string) =>
  `data:${type};base64,${readFileSync(join(root, 'public', path)).toString('base64')}`;

interface Card {
  out: string;
  eyebrow: string;
  title: string;
  footer: string;
}

// Section pages: the eyebrow names the section, the title says what is there.
const pages: Array<[path: string, eyebrow: string, title: string]> = [
  ['/observatory/', 'Observatory', 'The UAE Open Finance directory, observed daily'],
  [
    '/observatory/watch/',
    'Ecosystem Watch',
    'Standards, registrations and API traffic, every week',
  ],
  ['/observatory/briefing/', 'Observatory', 'The latest Ecosystem Watch briefing'],
  ['/observatory/coverage/', 'Observatory', 'API coverage and comparison across registrations'],
  ['/observatory/sandbox/', 'Observatory', 'The sandbox directory, observed daily'],
  ['/observatory/data/', 'Open data', 'Citable directory snapshots, history and changelog'],
  ['/observatory/methodology/', 'Observatory', 'How the figures are derived, and their limits'],
  ['/learn/', 'Learn', 'UAE Open Finance, explained in plain language'],
  ['/learn/getting-started/', 'Learn', 'Getting started with UAE Open Finance'],
  ['/learn/tpp-guide/', 'Learn', 'What a Third Party Provider does'],
  ['/learn/bank-guide/', 'Learn', 'What a bank or LFI provides'],
  ['/learn/api-guide/', 'Learn', 'The UAE Open Finance APIs at a glance'],
  ['/learn/back-office/', 'Learn', 'Running an Open Finance back office'],
  ['/learn/readiness/', 'Learn', 'Open Finance readiness worksheet'],
  ['/learn/faq/', 'Learn', 'UAE Open Finance: frequently asked questions'],
  ['/learn/glossary/', 'Learn', 'UAE Open Finance glossary'],
  ['/global/', 'Global perspective', 'How the UAE compares with other markets'],
  ['/global/uk/', 'Global perspective', 'UK Open Banking, compared with the UAE'],
  ['/global/eu/', 'Global perspective', 'PSD2, PSD3 and FiDA, compared with the UAE'],
  ['/global/gcc/', 'Global perspective', 'Open Finance across the GCC'],
  ['/news/', 'News', 'UAE Open Finance news, curated by the community'],
  ['/updates/', 'Updates', 'What changed across UAE Open Finance'],
  ['/data-sandbox/', 'Data Sandbox', 'See the data before you build on it'],
  ['/commons/', 'Commons', 'Shared insights, references and tools'],
  ['/community/', 'Community', 'Build UAE Open Finance in the open'],
  ['/about/', 'About', 'An independent, community-led view of UAE Open Finance'],
];

const typeLabels: Record<string, string> = {
  official: 'Regulatory news',
  milestone: 'Ecosystem news',
  community: 'Community news',
  global: 'International news',
  opinion: 'Opinion',
};

function frontmatter(file: string) {
  const text = readFileSync(file, 'utf8');
  const block = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const field = (name: string) =>
    block
      .match(new RegExp(`^${name}:\\s*(.*)$`, 'm'))?.[1]
      ?.trim()
      .replace(/^["']|["']$/g, '')
      .replace(/\\"/g, '"');
  return { title: field('title'), date: field('date'), type: field('type'), image: field('image') };
}

function newsCards(): Card[] {
  const dir = join(root, 'src/content/news');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .flatMap((f) => {
      const id = f.replace(/\.mdx?$/, '');
      const data = frontmatter(join(dir, f));
      if (data.image || !data.title || !data.date) return [];
      const date = new Date(`${data.date.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      });
      return [
        {
          out: join(root, 'public', `og/news/${id}.png`),
          eyebrow: typeLabels[data.type ?? ''] ?? 'News',
          title: data.title,
          footer: `${date} · openfinance-os.org/news`,
        },
      ];
    });
}

function pageCards(): Card[] {
  return pages.map(([path, eyebrow, title]) => ({
    out: join(root, 'public', ogCardPath(path)),
    eyebrow,
    title,
    footer: `openfinance-os.org${path === '/' ? '' : path.replace(/\/$/, '')}`,
  }));
}

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const fonts = `
  @font-face { font-family: 'DM Sans'; font-weight: 400; src: url('${dataURL('fonts/dm-sans-regular.ttf', 'font/ttf')}'); }
  @font-face { font-family: 'DM Sans'; font-weight: 500; src: url('${dataURL('fonts/dm-sans-medium.ttf', 'font/ttf')}'); }
  @font-face { font-family: 'DM Sans'; font-weight: 600; src: url('${dataURL('fonts/dm-sans-semibold.ttf', 'font/ttf')}'); }`;
const logo = dataURL('brand/logo-full.svg', 'image/svg+xml');

const html = (card: Card) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><style>${fonts}
  * { box-sizing: border-box; }
  body { margin: 0; background: #F6F8F5; color: #0D4F4F; font-family: 'DM Sans', sans-serif; }
  main { width: 1200px; height: 630px; padding: 64px 80px 56px; display: flex; flex-direction: column; border-bottom: 12px solid #0D4F4F; }
  img { width: 300px; height: auto; }
  .eyebrow { margin: auto 0 20px; font-size: 26px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #B36B12; }
  h1 { margin: 0; font-size: var(--size); line-height: 1.1; font-weight: 500; letter-spacing: -0.02em; max-width: 1040px; }
  footer { margin-top: auto; padding-top: 32px; color: #526662; font-size: 24px; }
</style></head>
<body><main>
  <img src="${logo}" alt="">
  <p class="eyebrow">${escape(card.eyebrow)}</p>
  <h1 style="--size: ${card.title.length > 90 ? 50 : card.title.length > 60 ? 58 : 68}px">${escape(card.title)}</h1>
  <footer>${escape(card.footer)}</footer>
</main></body></html>`;

const only = process.argv.find((a) => a === '--news-only' || a === '--pages-only');
const cards = [
  ...(only === '--news-only' ? [] : pageCards()),
  ...(only === '--pages-only' ? [] : newsCards()),
];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const card of cards) {
  mkdirSync(join(card.out, '..'), { recursive: true });
  await page.setContent(html(card), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: card.out, type: 'png' });
}
await browser.close();
console.log(`Wrote ${cards.length} social cards`);
