import { test, expect } from '@playwright/test';

/**
 * E2E tests for Arabic localization and RTL support
 *
 * Note: These tests are designed to validate the i18n infrastructure once implemented.
 * They test the expected behavior of Arabic pages with RTL layout.
 */

test.describe('Arabic Localization', () => {
  test.describe('Page Attributes', () => {
    test('Arabic pages should have RTL direction attribute', async ({ page }) => {
      await page.goto('/ar');

      const html = page.locator('html');
      await expect(html).toHaveAttribute('dir', 'rtl');
    });

    test('Arabic pages should have Arabic lang attribute', async ({ page }) => {
      await page.goto('/ar');

      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', 'ar');
    });

    test('English pages should have LTR direction attribute', async ({ page }) => {
      await page.goto('/');

      const html = page.locator('html');
      await expect(html).toHaveAttribute('dir', 'ltr');
    });

    test('English pages should have English lang attribute', async ({ page }) => {
      await page.goto('/');

      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', 'en');
    });
  });

  test.describe('Language Switcher', () => {
    test('should display language switcher in header', async ({ page }) => {
      await page.goto('/');

      const languageSwitcher = page.locator('[data-testid="language-switcher"]');
      await expect(languageSwitcher).toBeVisible();
    });

    test('should navigate from English to Arabic', async ({ page }) => {
      await page.goto('/');

      // Click language switcher
      await page.click('[data-testid="language-switcher"]');

      // Select Arabic
      await page.click('[data-testid="locale-ar"]');

      // Verify navigation to Arabic page
      await expect(page).toHaveURL(/\/ar/);

      // Verify RTL direction
      const html = page.locator('html');
      await expect(html).toHaveAttribute('dir', 'rtl');
    });

    test('should navigate from Arabic to English', async ({ page }) => {
      await page.goto('/ar');

      // Click language switcher
      await page.click('[data-testid="language-switcher"]');

      // Select English
      await page.click('[data-testid="locale-en"]');

      // Verify navigation to English page
      await expect(page).not.toHaveURL(/\/ar/);

      // Verify LTR direction
      const html = page.locator('html');
      await expect(html).toHaveAttribute('dir', 'ltr');
    });

    test('should preserve current page path when switching languages', async ({ page }) => {
      await page.goto('/observatory');

      // Switch to Arabic
      await page.click('[data-testid="language-switcher"]');
      await page.click('[data-testid="locale-ar"]');

      // Should be on Arabic observatory page
      await expect(page).toHaveURL(/\/ar\/observatory/);
    });
  });

  test.describe('Navigation Labels', () => {
    test('should display Arabic navigation labels on Arabic pages', async ({ page }) => {
      await page.goto('/ar');

      const nav = page.locator('nav');

      // Check for Arabic navigation text
      await expect(nav).toContainText('المرصد'); // Observatory
      await expect(nav).toContainText('التحديثات'); // Updates
      await expect(nav).toContainText('تعلّم'); // Learn
    });

    test('should display English navigation labels on English pages', async ({ page }) => {
      await page.goto('/');

      const nav = page.locator('nav');

      // Check for English navigation text
      await expect(nav).toContainText('Observatory');
      await expect(nav).toContainText('Updates');
      await expect(nav).toContainText('Learn');
    });
  });

  test.describe('RTL Layout', () => {
    test('header elements should be positioned correctly in RTL', async ({ page }) => {
      await page.goto('/ar');

      // In RTL, navigation items should flow from right to left
      const header = page.locator('header');
      await expect(header).toBeVisible();

      // Get the first and last nav links
      const navLinks = header.locator('nav a');
      const count = await navLinks.count();

      if (count >= 2) {
        const firstLink = await navLinks.first().boundingBox();
        const lastLink = await navLinks.last().boundingBox();

        // In RTL layout, the first link should be to the right of the last link
        // (higher x value means more to the right)
        if (firstLink && lastLink) {
          expect(firstLink.x).toBeGreaterThan(lastLink.x);
        }
      }
    });

    test('text alignment should be right-aligned in RTL', async ({ page }) => {
      await page.goto('/ar');

      // Check that body text is right-aligned
      const body = page.locator('body');
      const computedStyle = await body.evaluate((el) => {
        return window.getComputedStyle(el).direction;
      });

      expect(computedStyle).toBe('rtl');
    });

    test('footer layout should respect RTL direction', async ({ page }) => {
      await page.goto('/ar');

      const footer = page.locator('footer');
      await expect(footer).toBeVisible();

      // Check footer contains Arabic text
      await expect(footer).toContainText('روابط سريعة'); // Quick Links
    });
  });

  test.describe('Page Content Translation', () => {
    test('homepage hero should display Arabic content', async ({ page }) => {
      await page.goto('/ar');

      // Check for Arabic hero text
      const hero = page.locator('main').first();
      await expect(hero).toContainText('مجتمع التمويل المفتوح في الإمارات');
    });

    test('404 page should display Arabic content', async ({ page }) => {
      await page.goto('/ar/nonexistent-page');

      // Check for Arabic 404 text
      await expect(page.locator('body')).toContainText('الصفحة غير موجودة');
    });
  });

  test.describe('Cross-page Consistency', () => {
    const arabicPages = ['/ar', '/ar/observatory', '/ar/news', '/ar/learn'];

    for (const pagePath of arabicPages) {
      test(`${pagePath} should have consistent RTL attributes`, async ({ page }) => {
        await page.goto(pagePath);

        const html = page.locator('html');
        await expect(html).toHaveAttribute('dir', 'rtl');
        await expect(html).toHaveAttribute('lang', 'ar');

        // Header should be visible with Arabic text
        const header = page.locator('header');
        await expect(header).toBeVisible();

        // Footer should be visible
        const footer = page.locator('footer');
        await expect(footer).toBeVisible();
      });
    }
  });
});

test.describe('SEO and Accessibility', () => {
  test('Arabic pages should have correct hreflang tags', async ({ page }) => {
    await page.goto('/ar');

    // Check for hreflang alternate links
    const enAlternate = page.locator('link[hreflang="en"]');
    const arAlternate = page.locator('link[hreflang="ar"]');

    await expect(enAlternate).toHaveCount(1);
    await expect(arAlternate).toHaveCount(1);
  });

  test('Arabic pages should have RTL-appropriate meta description', async ({ page }) => {
    await page.goto('/ar');

    const metaDescription = page.locator('meta[name="description"]');
    const content = await metaDescription.getAttribute('content');

    // Meta description should exist and ideally be in Arabic
    expect(content).toBeTruthy();
  });

  test('skip to content link should be translated', async ({ page }) => {
    await page.goto('/ar');

    // Look for skip link with Arabic text
    const skipLink = page.locator('a[href="#main-content"]');
    if ((await skipLink.count()) > 0) {
      await expect(skipLink).toContainText('انتقل إلى المحتوى');
    }
  });
});
