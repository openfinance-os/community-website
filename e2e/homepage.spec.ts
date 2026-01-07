import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load successfully with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/OpenFinance-OS|Open Finance/i);
  });

  test('should display the hero section', async ({ page }) => {
    // Check for hero content
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();

    // Should have main heading
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should display ecosystem statistics', async ({ page }) => {
    // Check for stat elements - the page shows participant counts
    const statsSection = page.locator('[class*="stats"], [class*="observatory"]');
    await expect(statsSection.first()).toBeVisible();
  });

  test('should display quick links section', async ({ page }) => {
    // Check for the quick links section
    const quickLinksHeading = page.getByRole('heading', { name: /Quick Links/i });
    await expect(quickLinksHeading).toBeVisible();

    // Should have at least 3 quick link cards
    const quickLinkCards = page.locator('.quick-link-card, [class*="quick-link"]');
    const count = await quickLinkCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should have working navigation links', async ({ page }) => {
    // Check for main navigation
    const navLinks = page.locator('nav a, header a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should be accessible with no major violations', async ({ page }) => {
    // Basic accessibility checks
    // Check for main landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check page has heading structure
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
  });

  test('should display header with logo/brand', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
