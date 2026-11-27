import { expect, test, type Page } from '@playwright/test';

async function installPostHog(page: Page) {
  await page.addInitScript(() => {
    const calls: unknown[][] = [];
    (window as unknown as { __newsMapCaptures: unknown[][] }).__newsMapCaptures = calls;
    window.posthog = {
      capture: (...args: unknown[]) => {
        calls.push(args);
      },
      identify: () => {},
      register: () => {},
    };
  });
}

async function events(page: Page, name: string) {
  return page.evaluate((eventName) => {
    return (window as unknown as { __newsMapCaptures: unknown[][] }).__newsMapCaptures.filter(
      (call) => call[0] === eventName
    );
  }, name);
}

async function keepOnPage(card: ReturnType<Page['locator']>) {
  await card.evaluate((element) => {
    element.addEventListener('click', (event) => event.preventDefault(), true);
  });
}

test('map, legend, range, and country pages capture PostHog events', async ({ page }) => {
  await installPostHog(page);
  await page.goto('/updates/?country=eu');

  await expect
    .poll(() => events(page, 'news_country_selected'))
    .toEqual([
      [
        'news_country_selected',
        expect.objectContaining({
          country_code: 'EU',
          time_range: '90',
          source: 'url',
          page_url: '/updates/',
        }),
      ],
    ]);

  await page.locator('.map-dots [data-country-filter="EU"]').click();
  await expect
    .poll(() => events(page, 'news_country_filter_cleared'))
    .toEqual([
      [
        'news_country_filter_cleared',
        expect.objectContaining({
          country_code: 'EU',
          time_range: '90',
          source: 'map_dot',
        }),
      ],
    ]);

  await page.locator('.map-dots [data-country-filter="KW"]').click();
  await expect
    .poll(() => events(page, 'news_country_selected'))
    .toEqual([
      expect.anything(),
      [
        'news_country_selected',
        expect.objectContaining({
          country_code: 'KW',
          time_range: '90',
          source: 'map_dot',
        }),
      ],
    ]);

  await page
    .locator('.country-legend')
    .getByRole('button', { name: /European Union/ })
    .click();
  await expect.poll(() => events(page, 'news_country_selected')).toHaveLength(3);
  await expect
    .poll(() => events(page, 'news_country_selected'))
    .toEqual([
      expect.anything(),
      expect.anything(),
      [
        'news_country_selected',
        expect.objectContaining({
          country_code: 'EU',
          time_range: '90',
          source: 'legend',
        }),
      ],
    ]);

  await page
    .getByRole('group', { name: 'Map time range' })
    .getByRole('button', { name: '30 days' })
    .click();
  await expect
    .poll(() => events(page, 'news_map_range_changed'))
    .toEqual([
      [
        'news_map_range_changed',
        expect.objectContaining({
          time_range: '30',
          previous_time_range: '90',
          country_code: 'EU',
        }),
      ],
    ]);

  const card = page.locator('#news-grid a.news-card').filter({ visible: true }).first();
  const slug = await card.getAttribute('data-slug');
  expect(slug).toBeTruthy();
  await keepOnPage(card);
  await card.click();
  await expect
    .poll(() => events(page, 'news_filtered_story_clicked'))
    .toEqual([
      [
        'news_filtered_story_clicked',
        expect.objectContaining({
          country_code: 'EU',
          time_range: '30',
          source: 'legend',
          slug,
          page_url: '/updates/',
        }),
      ],
    ]);

  await page.goto('/news/country/ae/');
  await expect
    .poll(() => events(page, 'news_country_page_viewed'))
    .toEqual([
      [
        'news_country_page_viewed',
        expect.objectContaining({
          country_code: 'AE',
          time_range: 'all',
          source: 'url',
          page_url: '/news/country/ae/',
        }),
      ],
    ]);

  const countryCard = page.locator('#country-news a.news-card').first();
  const countrySlug = await countryCard.getAttribute('data-slug');
  expect(countrySlug).toBeTruthy();
  await keepOnPage(countryCard);
  await countryCard.click();
  await expect
    .poll(() => events(page, 'news_filtered_story_clicked'))
    .toEqual([
      [
        'news_filtered_story_clicked',
        expect.objectContaining({
          country_code: 'AE',
          time_range: 'all',
          source: 'url',
          slug: countrySlug,
          page_url: '/news/country/ae/',
        }),
      ],
    ]);
});

test('map and country pages still work when PostHog is not loaded', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/updates/');
  await page.locator('.map-dots [data-country-filter="KW"]').click();
  await expect(page).toHaveURL(/[?&]country=KW$/);
  await page.locator('.country-legend').getByRole('button', { name: 'All countries' }).click();
  await expect(page).not.toHaveURL(/country=/);

  await page
    .getByRole('group', { name: 'Map time range' })
    .getByRole('button', { name: 'All time' })
    .click();
  await expect(page.locator('#news-map-trend')).toContainText(/in total/);

  await page.goto('/updates/?country=AE');
  await expect(page.locator('.country-legend [data-country-filter="AE"]')).toHaveAttribute(
    'aria-pressed',
    'true'
  );

  await page.goto('/news/country/ae/');
  await expect(page.getByRole('heading', { level: 1, name: 'United Arab Emirates' })).toBeVisible();
  expect(errors).toEqual([]);
});
