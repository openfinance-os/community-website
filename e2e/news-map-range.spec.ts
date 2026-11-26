import { test, expect, type APIRequestContext } from '@playwright/test';

async function sitemapText(request: APIRequestContext): Promise<string> {
  const index = await request.get('/sitemap-index.xml');
  expect(index.ok()).toBeTruthy();
  const indexBody = await index.text();
  const children = [...indexBody.matchAll(/\/sitemap-[^<"']+\.xml/g)].map((match) => match[0]);
  const parts = [indexBody];
  for (const child of children) {
    const response = await request.get(child);
    expect(response.ok()).toBeTruthy();
    parts.push(await response.text());
  }
  return parts.join('\n');
}

test('map time range, trend line, and country pages', async ({ page, request }) => {
  await page.goto('/updates/');

  const range = page.getByRole('group', { name: 'Map time range' });
  await expect(range.getByRole('button', { name: '90 days' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  const trend = page.locator('#news-map-trend');
  await expect(trend).toContainText(/UAE stories in the last 90 days/);
  const uae90 = Number(
    await page.locator('.country-legend [data-country-filter="AE"] .legend-count').textContent()
  );
  expect(uae90).toBeGreaterThan(0);

  await range.getByRole('button', { name: 'All time' }).click();
  await expect(range.getByRole('button', { name: 'All time' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(range.getByRole('button', { name: '90 days' })).toHaveAttribute(
    'aria-pressed',
    'false'
  );
  const uaeAll = Number(
    await page.locator('.country-legend [data-country-filter="AE"] .legend-count').textContent()
  );
  expect(uaeAll).toBeGreaterThan(uae90);
  await expect(trend).toContainText(/in total/);
  expect(page.url()).not.toContain('country=');

  await page.locator('.country-legend a[href="/news/country/ae/"]').click();
  await expect(page).toHaveURL(/\/news\/country\/ae\/$/);
  await expect(page).toHaveTitle(/United Arab Emirates news/);
  await expect(page.getByRole('heading', { level: 1, name: 'United Arab Emirates' })).toBeVisible();
  const dates = await page
    .locator('#country-news time')
    .evaluateAll((elements) =>
      elements.map((element) => Date.parse(element.getAttribute('datetime') || ''))
    );
  expect(dates.length).toBe(uaeAll);
  expect(dates.every((date, index) => index === 0 || dates[index - 1] >= date)).toBe(true);

  await page.getByRole('link', { name: 'All updates' }).click();
  await expect(page).toHaveURL(/\/updates\/?$/);

  await page
    .getByRole('group', { name: 'Map time range' })
    .getByRole('button', { name: '30 days' })
    .click();
  await expect(page.locator('#news-map-trend')).toContainText(/last 30 days/);

  const sitemap = await sitemapText(request);
  expect(sitemap).toContain('/news/country/ae/');
  expect(sitemap).toContain('/news/country/eu/');
});
