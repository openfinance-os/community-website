import { test, expect } from '@playwright/test';

/**
 * E2E tests for Arabic page navigation consistency
 *
 * These tests verify that when navigating through the Arabic version of the site,
 * users stay in Arabic and don't accidentally get redirected to English pages.
 */

test.describe('Arabic Navigation Consistency', () => {
  test.beforeEach(async ({ page }) => {
    // Start on Arabic homepage
    await page.goto('/ar');
  });

  test('Arabic homepage has correct RTL attributes', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(html).toHaveAttribute('lang', 'ar');
  });

  test('Arabic homepage displays Arabic content', async ({ page }) => {
    // Check for Arabic hero text
    await expect(page.locator('body')).toContainText('التمويل');
    await expect(page.locator('body')).toContainText('المفتوح');
    await expect(page.locator('body')).toContainText('مستقل');

    // Check for Arabic section titles
    await expect(page.locator('body')).toContainText('مشاركة المنظومة');
    await expect(page.locator('body')).toContainText('آخر الأخبار');
    await expect(page.locator('body')).toContainText('روابط سريعة');
  });

  test('language switcher shows AR as current language', async ({ page }) => {
    const languageSwitcher = page.locator('[data-testid="language-switcher"]');
    await expect(languageSwitcher).toBeVisible();

    // Current language should show AR
    const currentLang = languageSwitcher.locator('.current-language');
    await expect(currentLang).toHaveText('AR');
  });

  test('clicking Observatory link stays in Arabic', async ({ page }) => {
    // Find and click the Arabic Observatory button
    const observatoryLink = page.locator('a[href="/ar/observatory"]').first();
    await observatoryLink.click();

    // Wait for navigation
    await page.waitForURL(/\/ar\/observatory/);

    // Verify still in Arabic mode
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(html).toHaveAttribute('lang', 'ar');
  });

  test('clicking News link stays in Arabic', async ({ page }) => {
    // Find the Arabic news link
    const newsLink = page.locator('a[href="/ar/news"]').first();

    if ((await newsLink.count()) > 0) {
      await newsLink.click();
      await page.waitForURL(/\/ar\/news/);

      const html = page.locator('html');
      await expect(html).toHaveAttribute('dir', 'rtl');
      await expect(html).toHaveAttribute('lang', 'ar');
    }
  });

  test('internal links on Arabic page point to Arabic versions', async ({ page }) => {
    // Get all internal links that should be localized
    const internalLinks = page.locator('a[href^="/ar/"]');
    const count = await internalLinks.count();

    // There should be Arabic-prefixed links
    expect(count).toBeGreaterThan(0);

    // Check that none of the main navigation links point to English
    const nonArabicLinks = page.locator(
      'a[href^="/observatory"]:not([href^="/ar"]), ' +
        'a[href^="/news"]:not([href^="/ar"]), ' +
        'a[href^="/learn"]:not([href^="/ar"])'
    );

    // On Arabic pages, navigation links should be Arabic-prefixed
    // (excluding external links and anchor links)
    const mainContent = page.locator('main, .hero, .quick-links-section');
    const nonArabicInContent = mainContent.locator(
      'a[href^="/observatory"]:not([href^="/ar"]), ' + 'a[href^="/news"]:not([href^="/ar"])'
    );

    const nonArabicCount = await nonArabicInContent.count();
    expect(nonArabicCount).toBe(0);
  });

  test('hreflang tags are present and correct', async ({ page }) => {
    // Check for hreflang alternate links
    const enAlternate = page.locator('link[hreflang="en"]');
    const arAlternate = page.locator('link[hreflang="ar"]');
    const defaultAlternate = page.locator('link[hreflang="x-default"]');

    await expect(enAlternate).toHaveCount(1);
    await expect(arAlternate).toHaveCount(1);
    await expect(defaultAlternate).toHaveCount(1);

    // Verify the Arabic alternate points to current page
    const arHref = await arAlternate.getAttribute('href');
    expect(arHref).toContain('/ar');
  });

  test('switching to English and back to Arabic works', async ({ page }) => {
    // Click language switcher
    await page.click('[data-testid="language-switcher"]');

    // Click English option
    await page.click('[data-testid="locale-en"]');

    // Should be on English page now
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // Now switch back to Arabic
    await page.click('[data-testid="language-switcher"]');
    await page.click('[data-testid="locale-ar"]');

    // Should be back on Arabic page
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    // Verify Arabic content is displayed
    await expect(page.locator('body')).toContainText('التمويل');
  });

  test('Arabic page does not contain English-only navigation labels', async ({ page }) => {
    // The main hero and content sections should have Arabic text
    const heroContent = page.locator('.hero-content');

    // Should NOT contain English navigation text in hero
    // (Note: "GitHub" and "-os" are kept in English as brand names)
    const heroText = await heroContent.textContent();

    // Check that key English phrases are NOT present
    expect(heroText).not.toContain('Building transparency');
    expect(heroText).not.toContain('financial institutions connected');
    expect(heroText).not.toContain('Explore the Observatory');

    // Check that Arabic equivalents ARE present
    expect(heroText).toContain('نبني الشفافية');
    expect(heroText).toContain('مؤسسة مالية');
    expect(heroText).toContain('استكشف المرصد');
  });

  test('footer links are localized on Arabic page', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Footer should have Arabic quick links title if localized
    // Or at minimum, the page should maintain RTL direction in footer
    const footerDirection = await footer.evaluate((el) => {
      return window.getComputedStyle(el).direction;
    });

    expect(footerDirection).toBe('rtl');
  });
});

test.describe('Arabic Page Visual Consistency', () => {
  test('text flows right-to-left on Arabic page', async ({ page }) => {
    await page.goto('/ar');

    // Check computed direction on body
    const bodyDirection = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).direction;
    });

    expect(bodyDirection).toBe('rtl');
  });

  test('Arabic font is loaded', async ({ page }) => {
    await page.goto('/ar');

    // Check that IBM Plex Sans Arabic is in the font stack
    const fontLink = page.locator('link[href*="IBM+Plex+Sans+Arabic"]');
    await expect(fontLink).toHaveCount(1);
  });

  test('stats section displays Arabic labels', async ({ page }) => {
    await page.goto('/ar');

    // Check for Arabic stat labels
    const statsSection = page.locator('.hero-stat, .observatory-preview');

    // Should contain Arabic organization label
    await expect(page.locator('body')).toContainText('مؤسسة');
  });
});

test.describe('Arabic Navigation Flow', () => {
  test('complete user journey stays in Arabic', async ({ page }) => {
    // Step 1: Start at Arabic homepage
    await page.goto('/ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    // Step 2: Click on "Explore Observatory" button
    const observatoryBtn = page.locator('a.btn-primary[href="/ar/observatory"]');
    if ((await observatoryBtn.count()) > 0) {
      await observatoryBtn.click();
      await page.waitForURL(/\/ar\/observatory/);
      await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    }

    // Step 3: Go back to homepage via logo or back
    await page.goBack();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    // Step 4: Click "View all news" link
    const newsLink = page.locator('a[href="/ar/news"]').first();
    if ((await newsLink.count()) > 0) {
      await newsLink.click();
      await page.waitForURL(/\/ar\/news/);
      await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    }
  });

  test('browser back button maintains Arabic locale', async ({ page }) => {
    await page.goto('/ar');

    // Navigate to a subpage
    const observatoryLink = page.locator('a[href="/ar/observatory"]').first();
    if ((await observatoryLink.count()) > 0) {
      await observatoryLink.click();
      await page.waitForURL(/\/ar\/observatory/);
    }

    // Go back
    await page.goBack();

    // Should still be in Arabic
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
});
