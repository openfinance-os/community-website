import { test, expect } from '@playwright/test';

test.describe('Observatory Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/observatory');
  });

  test('should load observatory page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Observatory|Open Finance/i);
  });

  test('should display ecosystem statistics', async ({ page }) => {
    // Look for stat cards or statistics section
    const statsSection = page.locator('[class*="stat"], [class*="card"]');
    const count = await statsSection.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display participant information', async ({ page }) => {
    // Check for participant-related content
    const pageContent = await page.textContent('main');
    expect(pageContent?.toLowerCase()).toMatch(/participant|bank|provider|ecosystem/i);
  });

  test('should have data visualization elements', async ({ page }) => {
    // Look for charts or data visualization components
    const charts = page.locator('svg, [class*="chart"], [class*="donut"], canvas');
    const count = await charts.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display role distribution', async ({ page }) => {
    // Check for role information
    const pageContent = await page.textContent('body');
    // Should mention common roles in open finance
    expect(pageContent).toMatch(/ASPSP|TPP|Provider|Bank/i);
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(main).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(main).toBeVisible();
  });
});
