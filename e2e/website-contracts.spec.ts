import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { watchBriefing } from '../src/lib/watch-briefing';

const snapshot = JSON.parse(
  readFileSync(
    new URL('../data/observatory/snapshots/production/latest.json', import.meta.url),
    'utf8'
  )
);
const payload = JSON.parse(
  readFileSync(new URL('../data/watch/payload.json', import.meta.url), 'utf8')
);

test('default social metadata resolves to the built 1200x630 PNG', async ({ page, request }) => {
  await page.goto('/');
  const canonicalImage = 'https://openfinance-os.org/og-image.png';
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    canonicalImage
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    'content',
    canonicalImage
  );
  const response = await request.get(new URL(canonicalImage).pathname);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/png');
  const bytes = await response.body();
  expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(bytes.readUInt32BE(16)).toBe(1200);
  expect(bytes.readUInt32BE(20)).toBe(630);
});

test('homepage registration and metadata labels match the public snapshot', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-stat .stat-number')).toHaveText(
    String(snapshot.summary.totalParticipants)
  );
  await expect(page.locator('.hero-stat')).toContainText('production directory registrations');
  await expect(page.locator('.hero-stat')).toContainText(
    `${snapshot.summary.byStatus.Active} marked Active`
  );
  await expect(page.locator('.pipeline-stage').last()).toContainText('Production registrations');
  await expect(page.locator('.legend')).toContainText('Auth server published');
});

test('Watcher summary, dates and sources work without JavaScript and enter the sitemap', async ({
  browser,
  request,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/observatory/watch/');
  const summary = page.locator('#watch-summary');
  await expect(summary).toBeVisible();
  await expect(summary.locator('time')).toHaveCount(3);
  await expect(summary.locator('time').nth(0)).toHaveAttribute('datetime', payload.runDate);
  await expect(summary.locator('time').nth(1)).toHaveAttribute('datetime', payload.asOfData);
  await expect(summary).toContainText(watchBriefing(payload).items[0].text);
  await expect(page.getByRole('navigation', { name: 'Observatory' })).toBeVisible();
  await expect(summary.getByRole('link', { name: 'Read the integrated briefing' })).toBeVisible();
  await expect(summary.locator('a[href="https://nebras-open-finance.com/metrics"]')).toBeVisible();
  await expect(summary).toContainText('does not prove an institution is not certified');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://openfinance-os.org/observatory/watch/'
  );
  const sitemap = await request.get('/sitemap-0.xml');
  expect(sitemap.ok()).toBe(true);
  expect(
    (await sitemap.text()).match(/<loc>https:\/\/openfinance-os\.org\/observatory\/watch\/<\/loc>/g)
  ).toHaveLength(1);
  await context.close();
});

test('Watcher keeps the interactive dashboard with no visible duplicate summary', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/observatory/watch/');
  await expect(page.locator('#watch-summary')).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
  expect(await page.locator('script[src*="posthog.com"]').count()).toBe(0);
});

test('Watcher retains the dated summary when the interactive renderer fails', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(document, 'write', {
      value: () => {
        throw new Error('Controlled Watch renderer failure');
      },
    });
  });
  await page.goto('/observatory/watch/');
  await expect(page.locator('#watch-summary')).toBeVisible();
  await expect(page.locator('#watch-summary time')).toHaveCount(3);
  await expect(page.getByRole('navigation', { name: 'Observatory' })).toBeVisible();
  expect(errors).toEqual(['Controlled Watch renderer failure']);
});
