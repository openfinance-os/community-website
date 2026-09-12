import { test, expect } from '@playwright/test';

/**
 * Dark theme regression tests.
 *
 * The site resolves a theme in three ways: a stored choice, the system
 * preference, or the header toggle. All three must end with an explicit
 * `data-theme` attribute, because component styles key off that attribute
 * rather than the media query.
 */
test.describe('Theme', () => {
  test('system dark preference sets data-theme="dark" and dark surfaces', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/observatory');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bodyBg).toBe('rgb(15, 20, 25)');

    // Stat cards used to stay white in system-dark mode.
    const card = page.locator('.stat-card').first();
    await expect(card).toBeVisible();
    const cardBg = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(cardBg).not.toBe('rgb(255, 255, 255)');
  });

  test('system light preference sets data-theme="light"', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('stored preference wins over the system preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addInitScript(() => localStorage.setItem('theme', 'light'));
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('header toggle switches theme and persists it', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    await page.locator('.theme-toggle').first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('news article surfaces follow the theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/news');
    const firstArticle = page.locator('a[href^="/news/"]').first();
    await firstArticle.click();
    await page.waitForLoadState('domcontentloaded');

    const content = page.locator('.article-content').first();
    if (await content.count()) {
      const bg = await content.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).not.toBe('rgb(255, 255, 255)');
    }
  });
});
