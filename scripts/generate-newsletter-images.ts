/**
 * Render the newsletter page images in the Clear signal identity.
 * Regenerate with `npx tsx scripts/generate-newsletter-images.ts` (Chromium required).
 * Uses DM Sans from public/fonts and the supplied logo SVGs from brand/.
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ARCHIVE_OG_PATH,
  NEWSLETTER_OG_PATH,
  issueOgPath,
  normalizeOpenFinanceCasing,
} from '../src/lib/newsletter-images.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const fontURL = (file: string) =>
  `data:font/ttf;base64,${readFileSync(join(root, 'public/fonts', file)).toString('base64')}`;
const svgURL = (file: string) =>
  `data:image/svg+xml;base64,${readFileSync(join(root, 'brand', file)).toString('base64')}`;

const base = `
  @font-face { font-family: 'DM Sans'; font-weight: 400; src: url('${fontURL('dm-sans-regular.ttf')}'); }
  @font-face { font-family: 'DM Sans'; font-weight: 500; src: url('${fontURL('dm-sans-medium.ttf')}'); }
  @font-face { font-family: 'DM Sans'; font-weight: 600; src: url('${fontURL('dm-sans-semibold.ttf')}'); }
  * { box-sizing: border-box; margin: 0; }
  body {
    font-family: 'DM Sans', sans-serif;
    color: #132c2b;
    background: #f6f8f5;
    -webkit-font-smoothing: antialiased;
  }
`;

interface Story {
  file: string;
  eyebrow: string;
  headline: string;
  detail: string;
  source: string;
}

const stories: Story[] = [
  {
    file: 'story-registry-light.webp',
    eyebrow: 'UAE registry',
    headline: '12 of 30',
    detail: 'production registrations publish an authorization server',
    source: 'Production directory snapshot, 28 October 2026',
  },
  {
    file: 'story-calls-light.webp',
    eyebrow: 'Weekly digest',
    headline: '1.42M',
    detail: 'cumulative API calls, November 2025 to September 2026',
    source: 'Al Tareq platform logs via Ecosystem Watch, observed 26 October 2026',
  },
  {
    file: 'story-nbf-light.webp',
    eyebrow: 'UAE banks',
    headline: 'NBF Direct',
    detail: 'adds Open Finance with multi-bank access',
    source: 'Issue #1, 29 October 2026',
  },
  {
    file: 'story-commercial-light.webp',
    eyebrow: 'Sibos 2026',
    headline: 'Commercial models',
    detail: 'to scale account-to-account payments and AI services',
    source: 'Issue #1, 29 October 2026',
  },
  {
    file: 'story-europe-light.webp',
    eyebrow: 'Europe',
    headline: '9 markets',
    detail: 'Pay by Bank via Mastercard Open Finance',
    source: 'Issue #1, 29 October 2026',
  },
];

const storyHTML = (
  story: Story
) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
  ${base}
  main {
    position: relative;
    width: 1200px;
    height: 500px;
    padding: 72px 80px;
    background: #ffffff;
    border-left: 12px solid #0d4f4f;
  }
  .eyebrow {
    font-size: 26px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #526662;
  }
  h1 {
    margin-top: 28px;
    font-size: 120px;
    font-weight: 500;
    line-height: 1.02;
    letter-spacing: -0.055em;
    color: #0d4f4f;
  }
  .detail {
    max-width: 760px;
    margin-top: 24px;
    font-size: 36px;
    line-height: 1.3;
  }
  .source {
    position: absolute;
    left: 80px;
    bottom: 56px;
    font-size: 22px;
    color: #526662;
  }
  img { position: absolute; right: 64px; bottom: 48px; width: 72px; height: 72px; }
</style></head><body><main>
  <p class="eyebrow">${story.eyebrow}</p>
  <h1>${story.headline}</h1>
  <p class="detail">${story.detail}</p>
  <p class="source">${story.source}</p>
  <img src="${svgURL('logo-icon.svg')}" alt="">
</main></body></html>`;

const headerHTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
  ${base}
  main {
    width: 600px;
    height: 200px;
    padding: 40px 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 22px;
    background: #082e30;
    color: #f1f7f1;
  }
  img { width: 300px; height: auto; display: block; }
  p { font-size: 18px; color: #adc1b9; }
</style></head><body><main>
  <img src="${svgURL('logo-full-dark.svg')}" alt="">
  <p>Weekly briefing · Issue #1 · 29 October 2026</p>
</main></body></html>`;

const agentHTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
  ${base}
  main { width: 600px; height: 450px; padding: 28px 24px; background: #ffffff; }
  h1 { font-size: 20px; font-weight: 500; letter-spacing: -0.02em; color: #0d4f4f; }
  .flow { display: flex; align-items: stretch; gap: 6px; margin-top: 28px; }
  .step {
    flex: 1;
    padding: 14px 8px;
    border: 1.5px solid #dce5df;
    border-radius: 12px;
    text-align: center;
    background: #ffffff;
  }
  .step strong { display: block; font-size: 14px; font-weight: 600; }
  .step span { display: block; margin-top: 8px; font-size: 12px; line-height: 1.35; color: #526662; }
  .step.hub { background: #e7efea; border: 2px solid #0d4f4f; }
  .step.hub strong { color: #0d4f4f; }
  .arrow { align-self: center; color: #526662; font-size: 18px; }
  .back { margin-top: 14px; font-size: 13px; text-align: center; color: #526662; }
  .fit {
    margin-top: 24px;
    padding: 16px 18px;
    border: 1px solid #dce5df;
    border-radius: 12px;
    background: #f6f8f5;
  }
  .fit h2 { font-size: 16px; font-weight: 600; color: #132c2b; }
  .fit ul { margin-top: 8px; padding-left: 18px; font-size: 13px; line-height: 1.55; }
  .note { margin-top: 16px; font-size: 11px; color: #526662; }
</style></head><body><main>
  <h1>How an AI agent reaches your bank in UAE Open Finance</h1>
  <div class="flow">
    <div class="step"><strong>Customer</strong><span>gives consent (scope and duration)</span></div>
    <div class="arrow">→</div>
    <div class="step"><strong>TPP / AI agent</strong><span>licensed provider, acts within consent</span></div>
    <div class="arrow">→</div>
    <div class="step hub"><strong>Nebras API Hub</strong><span>authorization and consent store</span></div>
    <div class="arrow">→</div>
    <div class="step"><strong>LFI / bank</strong><span>returns data or executes payment</span></div>
  </div>
  <p class="back">Data and payment responses flow back the same way: LFI → API Hub → TPP</p>
  <div class="fit">
    <h2>Where Al Tareq and Aani fit</h2>
    <ul>
      <li>Al Tareq: the UAE Open Finance brand the customer sees when sharing data or authorizing a payment</li>
      <li>Aani: the instant payment rail that can settle account-to-account payments</li>
      <li>TPPs never call banks directly; the API Hub sits in the middle</li>
    </ul>
  </div>
  <p class="note">Simplified community illustration. Not an official diagram.</p>
</main></body></html>`;

const topics: [string, number][] = [
  ['UAE ecosystem', 3],
  ['Agentic payments', 2],
  ['Pay by Bank (Europe)', 1],
  ['Commercial models', 1],
];
const topicsHTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
  ${base}
  main { width: 600px; height: 260px; padding: 24px; background: #ffffff; }
  h1 { font-size: 18px; font-weight: 500; letter-spacing: -0.02em; color: #0d4f4f; }
  dl { display: grid; grid-template-columns: 170px 1fr; gap: 12px 12px; margin-top: 22px; align-items: center; }
  dt { font-size: 14px; text-align: right; }
  dd { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; }
  .bar { height: 28px; border-radius: 4px; background: #0d4f4f; }
</style></head><body><main>
  <h1>This issue's 7 stories by topic</h1>
  <dl>
    ${topics
      .map(
        ([label, count]) =>
          `<dt>${label}</dt><dd><span class="bar" style="width:${(count / 3) * 320}px"></span>${count}</dd>`
      )
      .join('')}
  </dl>
</main></body></html>`;

// `scale` renders extra device pixels so archive images stay sharp at about
// 1440px (card) and 1240px (article) on retina screens.
const outputs: { file: string; html: string; width: number; height: number; scale: number }[] = [
  { file: 'header.webp', html: headerHTML, width: 600, height: 200, scale: 5 },
  { file: 'agent-access.webp', html: agentHTML, width: 600, height: 450, scale: 5 },
  { file: 'topics.webp', html: topicsHTML, width: 600, height: 260, scale: 5 },
  ...stories.map((story) => ({
    file: story.file,
    html: storyHTML(story),
    width: 1200,
    height: 500,
    scale: 3,
  })),
];

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
try {
  for (const { file, html, width, height, scale } of outputs) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
    await page.setContent(html);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const overflow = await page.evaluate(() => {
      const main = document.querySelector('main')!;
      return main.scrollHeight > main.clientHeight || main.scrollWidth > main.clientWidth;
    });
    if (overflow) throw new Error(`${file}: content overflows ${width}×${height}`);
    const png = await page.screenshot({ type: 'png' });
    await sharp(png)
      .webp({ quality: 90 })
      .toFile(join(root, 'public/newsletter', file));
    await page.close();
    console.log(`Generated public/newsletter/${file} (${width * scale}×${height * scale}).`);
  }

  const escapeHTML = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const renderOgCard = async (path: string, kicker: string, title: string, footer: string) => {
    const ogHTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
      ${base}
      body { background: #f6f8f5; }
      main {
        width: 1200px;
        height: 630px;
        padding: 72px 80px 56px;
        display: flex;
        flex-direction: column;
        background: #f6f8f5;
        border-top: 12px solid #e8a85c;
      }
      img { width: 280px; height: auto; }
      p.kicker { margin-top: 36px; font-size: 22px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #526662; }
      h1 { max-width: 980px; margin-top: 18px; font-size: 54px; font-weight: 500; line-height: 1.12; letter-spacing: -0.03em; color: #0d4f4f; }
      p.date { margin-top: auto; font-size: 24px; color: #526662; }
    </style></head><body><main>
      <img src="${svgURL('logo-full.svg')}" alt="">
      <p class="kicker">${escapeHTML(kicker)}</p>
      <h1>${escapeHTML(title)}</h1>
      <p class="date">${escapeHTML(footer)}</p>
    </main></body></html>`;
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });
    await page.setContent(ogHTML);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const overflow = await page.evaluate(() => {
      const main = document.querySelector('main')!;
      return main.scrollHeight > main.clientHeight || main.scrollWidth > main.clientWidth;
    });
    if (overflow) throw new Error(`${path}: social card overflows 1200×630`);
    const relative = path.replace(/^\//, '');
    const target = join(root, 'public', relative);
    mkdirSync(join(target, '..'), { recursive: true });
    await page.screenshot({ path: target, type: 'png' });
    await page.close();
    console.log(`Generated public/${relative} (1200×630).`);
  };

  await renderOgCard(
    NEWSLETTER_OG_PATH,
    'Weekly briefing',
    'The 5-minute weekly on UAE Open Finance, for the people building it',
    'Free · Weekly · openfinance-os.org/newsletter'
  );
  await renderOgCard(
    ARCHIVE_OG_PATH,
    'Newsletter archive',
    'Past issues of the weekly UAE Open Finance briefing',
    'openfinance-os.org/newsletter/archive'
  );

  const issues = JSON.parse(readFileSync(join(root, 'data/newsletter/issues.json'), 'utf8')) as {
    slug: string;
    subject: string;
    publish_date: string;
  }[];
  for (const issue of issues) {
    const published = new Date(issue.publish_date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
    await renderOgCard(
      issueOgPath(issue.slug),
      'Newsletter',
      normalizeOpenFinanceCasing(issue.subject),
      `${published} · openfinance-os.org`
    );
  }
} finally {
  await browser.close();
}
