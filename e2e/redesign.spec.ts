import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const snapshot = JSON.parse(
  readFileSync(new URL('../data/observatory/snapshots/latest.json', import.meta.url), 'utf8')
);

test('directory preview switches environment without conflating saved observations', async ({
  page,
}) => {
  await page.goto('/');
  const production = page.locator('#directory-panel-production');
  const sandbox = page.locator('#directory-panel-sandbox');
  await expect(production).toContainText(`${snapshot.production.summary.totalParticipants}`);
  await expect(production).toContainText('production directory registrations');
  await page.getByRole('tab', { name: 'Sandbox', exact: true }).click();
  await expect(production).toBeHidden();
  await expect(sandbox).toContainText(`${snapshot.sandbox.summary.totalParticipants}`);
  await expect(sandbox).toContainText('sandbox directory registrations');
  await expect(sandbox.locator('.families span')).toHaveText(snapshot.sandbox.summary.apiFamilies);
  await expect(sandbox).toContainText(
    'Directory registration does not establish operational status'
  );
  await expect(sandbox.locator('time')).toHaveAttribute('datetime', snapshot.sandbox.timestamp);
  await page.getByRole('tab', { name: 'Sandbox', exact: true }).press('Home');
  await expect(page.getByRole('tab', { name: 'Production', exact: true })).toBeFocused();
  await expect(production).toBeVisible();
});

test('offscreen and data-saving animation avoid automatic video requests', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'connection', {
      value: { saveData: true },
      configurable: true,
    })
  );
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('open-circuit-hero.mp4')) requests.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('#open-circuit-video')).not.toHaveAttribute('src');
  await page.locator('[data-open-circuit]').scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Play animation', exact: true })).toBeVisible();
  expect(requests).toHaveLength(0);
  await page.getByRole('button', { name: 'Play animation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause animation', exact: true })).toBeVisible();
});

for (const theme of ['light', 'dark']) {
  test(`redesign stays usable in ${theme} mode on mobile and desktop`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Open finance.In full view.'
      );
      await expect(
        page.getByRole('link', { name: 'Explore the Observatory', exact: true })
      ).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width
      );
      expect(await page.locator('h1').evaluate((el) => getComputedStyle(el).fontFamily)).toContain(
        'DM Sans'
      );
      await expect(page.locator('.search-trigger')).toBeVisible();
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const menu = page.getByRole('button', { name: 'Toggle menu', exact: true });
    await menu.click();
    await expect(
      page.getByRole('navigation', { name: 'Mobile navigation', exact: true })
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    if (theme === 'dark') {
      await menu.click();
      await expect(page.locator('.theme-label-dark')).toBeVisible();
      const menuBackground = await page
        .locator('.nav-mobile')
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(menuBackground).toBe('rgb(23, 48, 46)');
    }
  });
}

for (const theme of ['light', 'dark'] as const) {
  test(`mobile hero stays stable when CTA fonts load in ${theme} mode`, async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
    let releaseFonts!: () => void;
    let heldFonts = 0;
    const fontGate = new Promise<void>((resolve) => {
      releaseFonts = resolve;
    });
    await page.route('**/fonts/dm-sans-*.ttf', async (route) => {
      if (/(semibold|bold)\.ttf$/.test(route.request().url())) {
        heldFonts++;
        await fontGate;
      }
      await route.continue();
    });
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.evaluate(async () => {
        await Promise.all([
          document.fonts.load('400 15px "DM Sans"'),
          document.fonts.load('500 56px "DM Sans"'),
        ]);
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );
      });
      await expect.poll(() => heldFonts).toBe(2);
      const snapshot = page.locator('.directory-snapshot');
      const before = await snapshot.boundingBox();
      releaseFonts();
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );
      });
      const after = await snapshot.boundingBox();
      expect(Math.abs(after!.y - before!.y)).toBeLessThanOrEqual(1);
      await expect(
        page.getByRole('link', { name: 'Explore the Observatory', exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: 'Find your starting point', exact: true })
      ).toBeVisible();
    } finally {
      releaseFonts();
    }
  });
}
