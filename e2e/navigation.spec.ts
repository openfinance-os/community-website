import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test('should navigate from homepage to observatory', async ({ page }) => {
    await page.goto('/');

    // Find and click observatory link
    const observatoryLink = page.getByRole('link', { name: /observatory/i });
    await observatoryLink.first().click();

    await expect(page).toHaveURL(/.*observatory/);
  });

  test('should navigate from homepage to learn', async ({ page }) => {
    await page.goto('/');

    // Find and click learn link
    const learnLink = page.getByRole('link', { name: /learn|resources|guide/i });
    await learnLink.first().click();

    await expect(page).toHaveURL(/.*learn/);
  });

  test('should navigate from homepage to news', async ({ page }) => {
    await page.goto('/');

    // Find and click news link
    const newsLink = page.getByRole('link', { name: /news/i });
    await newsLink.first().click();

    await expect(page).toHaveURL(/.*news/);
  });

  test('should have working logo link to homepage', async ({ page }) => {
    await page.goto('/observatory');

    // Click on logo/brand to go home (target main site header, not card headers)
    const logoLink = page.locator('header.header a').first();
    await logoLink.click();

    await expect(page).toHaveURL('/');
  });

  test('header navigation should be consistent across pages', async ({ page }) => {
    const pages = ['/', '/observatory', '/news', '/learn'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      // Target main site header specifically (class="header"), not card-headers
      const header = page.locator('header.header');
      await expect(header).toBeVisible();

      // Should have navigation links
      const navLinks = header.locator('a');
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('footer should be consistent across pages', async ({ page }) => {
    const pages = ['/', '/observatory', '/news'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    }
  });
});
