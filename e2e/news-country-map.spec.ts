import { expect, test } from '@playwright/test';

test.describe('news country map', () => {
  test('renders the 90-day map and filters the list from a dot', async ({ page }) => {
    await page.goto('/news/');

    const map = page.locator('.news-origin-map');
    await expect(map.getByText('Where the news came from, last 90 days')).toBeVisible();
    await expect(map.locator('svg path.land')).toHaveCount(1);
    await expect(map.locator('svg')).toHaveAttribute('aria-hidden', 'true');

    const uae = map.locator('.dot[data-country="AE"]');
    await expect(uae).toBeVisible();
    await expect(uae).toHaveAttribute('aria-label', /United Arab Emirates, \d+ stories/);
    await expect(map.locator('.pin-label')).toHaveText('European Union');
    await expect(map.locator('.news-origin-counts')).toContainText('United Arab Emirates');
    await expect(map.locator('.news-origin-counts')).toContainText('European Union');

    const before = await page.locator('#news-grid .news-card').count();
    await uae.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'center' }));
    await uae.click();
    await expect(page).toHaveURL(/[?&]country=AE$/);

    const visibleCountries = await page
      .locator('#news-grid .news-card')
      .evaluateAll((elements) =>
        elements
          .filter((element) => (element as HTMLElement).style.display !== 'none')
          .map((element) => element.getAttribute('data-country') || '')
      );
    expect(visibleCountries.length).toBeGreaterThan(0);
    expect(visibleCountries.length).toBeLessThan(before);
    expect(visibleCountries.every((value) => value.split(/\s+/).includes('AE'))).toBe(true);
    await expect(page.locator('#news-grid .news-card[data-country="BR"]')).toBeHidden();

    await page.getByRole('button', { name: 'Show all countries' }).click();
    await expect(page).not.toHaveURL(/country=/);
    await expect(page.locator('#news-grid .news-card[data-country="BR"]')).toBeVisible();
  });

  test('opens a shared country URL, accepts keyboard input, and clears with the other filters', async ({
    page,
  }) => {
    await page.goto('/news/?country=BR');

    await expect(page.locator('.featured-section')).toBeHidden();
    await expect(page.locator('#news-grid .news-card[data-country="BR"]')).toBeVisible();
    await expect(page.locator('.news-origin-map .dot[data-country="BR"]')).toHaveAttribute(
      'aria-current',
      'true'
    );

    const comparison = page.locator(
      '#news-grid .news-card[data-slug="2026-11-12-saudi-open-banking-vs-uae-open-finance"]'
    );
    await page.goto('/news/?country=SA');
    await expect(comparison).toBeVisible();
    await expect(comparison).toHaveAttribute('data-country', /AE/);
    await expect(comparison).toHaveAttribute('data-country', /SA/);

    await page.goto('/news/');
    const kuwait = page.locator('.news-origin-map .dot[data-country="KW"]');
    await kuwait.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/[?&]country=KW$/);
    const visible = await page
      .locator('#news-grid .news-card')
      .evaluateAll((elements) =>
        elements
          .filter((element) => (element as HTMLElement).style.display !== 'none')
          .map((element) => element.getAttribute('data-country') || '')
      );
    expect(visible.length).toBeGreaterThan(0);
    expect(visible.every((value) => value.split(/\s+/).includes('KW'))).toBe(true);

    await page.locator('.news-filter [data-filter-type="opinion"]').click();
    await expect(page.locator('#empty-state')).toBeVisible();
    await page.locator('#reset-filters').click();
    await expect(page).not.toHaveURL(/country=/);
    await expect(page.locator('.featured-section')).toBeVisible();

    const digest = page.locator('#news-grid .news-card[data-slug$="weekly-digest"]').first();
    await expect(digest).not.toHaveAttribute('data-country');
  });

  test('public updates index shows the map and filters by country', async ({ page }) => {
    await page.goto('/updates/');
    await expect(page.getByText('Where the news came from, last 90 days')).toBeVisible();
    const uae = page.locator('.news-origin-map .dot[data-country="AE"]');
    await uae.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'center' }));
    await uae.click();
    await expect(page).toHaveURL(/[?&]country=AE$/);
    const visible = await page
      .locator('#news-grid > [data-news-type]')
      .evaluateAll((elements) =>
        elements
          .filter((element) => (element as HTMLElement).style.display !== 'none')
          .map((element) => element.querySelector('.news-card')?.getAttribute('data-country') || '')
      );
    expect(visible.length).toBeGreaterThan(0);
    expect(visible.every((value) => value.split(/\s+/).includes('AE'))).toBe(true);
  });
});
