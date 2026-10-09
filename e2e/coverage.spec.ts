import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const watchPayload = JSON.parse(
  readFileSync(new URL('../data/watch/payload.json', import.meta.url), 'utf8')
);
const production = JSON.parse(
  readFileSync(
    new URL('../data/observatory/snapshots/production/latest.json', import.meta.url),
    'utf8'
  )
);
const sandbox = JSON.parse(
  readFileSync(
    new URL('../data/observatory/snapshots/sandbox/latest.json', import.meta.url),
    'utf8'
  )
);

test('site search leads to the new coverage tool', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.locator('.search-input').fill('Coverage');
  await page.locator('.search-results a[href="/observatory/coverage/"]').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('API coverage & comparison');
  await expect(page.locator('select[name="environment"]')).toBeEnabled();
});

test('filters insurance coverage, retains resource declarations and exports source dates', async ({
  page,
}) => {
  await page.goto('/observatory/coverage/');
  await page.locator('select[name="family"]').selectOption('insurance');
  await page.locator('select[name="version"]').selectOption('2.1');
  const matching = production.participants.filter(
    (p: { apiResources: Array<{ family: string; version: string }> }) =>
      p.apiResources.some((r) => r.family === 'insurance' && r.version === '2.1')
  );
  await expect(page.locator('#coverage-rows tr:visible')).toHaveCount(matching.length);
  await page.locator('#coverage-rows tr:visible details summary').first().click();
  await expect(page.locator('#coverage-rows tr:visible').first()).toContainText('certification:');
  await expect(page.locator('#coverage-rows tr:visible').first()).toContainText('completeness:');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download filtered CSV' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const csv = readFileSync(path!, 'utf8');
  expect(csv).toContain(production.timestamp);
  expect(csv).toContain('"insurance"');
  expect(csv).toContain('Unknown in directory dataset');
  expect(csv).not.toContain('"accounts"');
  await page.reload();
  await expect(page.locator('select[name="family"]')).toHaveValue('insurance');
  await expect(page.locator('select[name="version"]')).toHaveValue('2.1');
  await expect(page.locator('#coverage-rows tr:visible')).toHaveCount(matching.length);
});

test('compares stable IDs across filter changes and limits selection to three', async ({
  page,
}) => {
  await page.goto('/observatory/coverage/');
  const toggles = page.locator('#coverage-rows tr:visible .compare-toggle');
  const chosen = await toggles.evaluateAll((inputs) =>
    inputs.slice(0, 3).map((input) => (input as HTMLInputElement).value)
  );
  for (let index = 0; index < 3; index++) await toggles.nth(index).check();
  await toggles.nth(3).click();
  await expect(toggles.nth(3)).not.toBeChecked();
  await expect(page.locator('#comparison-status')).toContainText('up to 3');
  await page.locator('select[name="environment"]').selectOption('sandbox');
  await expect(page.locator('#comparison-table thead th')).toHaveCount(4);
  await expect(page.locator('#comparison-table')).toContainText('Unknown in directory dataset');
  await page.reload();
  for (const key of chosen)
    expect(new URL(page.url()).searchParams.getAll('compare')).toContain(key);
  await expect(page.locator('#comparison-table thead th')).toHaveCount(4);
  await page.getByRole('button', { name: 'Clear comparison' }).click();
  await expect(page.locator('#comparison')).toBeHidden();
});

test('both environments remain separate and profiles hand off to a dated comparison', async ({
  page,
}) => {
  await page.goto('/observatory/coverage/?environment=both');
  await expect(page.locator('#coverage-rows tr:visible')).toHaveCount(
    production.participants.length + sandbox.participants.length
  );
  const registration = production.participants.find((p: { apiFamilies: string[] }) =>
    p.apiFamilies.includes('insurance')
  );
  await page.goto(`/observatory/participant/${registration.id}`);
  await expect(page.getByRole('heading', { name: 'Observed directory timeline' })).toBeVisible();
  await expect(page.locator('.participant-timeline')).toContainText('collector update');
  await page.getByRole('link', { name: 'Compare this registration' }).click();
  await expect(page.locator('#comparison-table')).toContainText(registration.id);
});

test('mobile coverage and comparison scroll within their regions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/observatory/coverage/');
  await page.locator('#coverage-rows tr:visible .compare-toggle').first().check();
  const dimensions = await page.evaluate(() => ({
    viewport: innerWidth,
    width: document.documentElement.scrollWidth,
  }));
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport);
  await expect(
    page.getByRole('region', {
      name: 'Directory coverage table, scroll horizontally for all columns',
    })
  ).toBeVisible();
  await expect(page.locator('#comparison-table')).toBeVisible();
  await page.locator('input[name="query"]').fill('no-such-registration-12345');
  await expect(page.locator('#coverage-empty')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download filtered CSV' })).toBeDisabled();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(page.locator('#coverage-empty')).toBeHidden();
});

test('briefing, coverage and the Watch remain readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Latest saved briefing' })).toBeVisible();
  await expect(
    page.locator(`.briefing-date time[datetime="${watchPayload.asOfData}"]`)
  ).toBeVisible();
  await page.goto('/observatory/coverage/');
  await expect(page.locator('#coverage-rows tr:visible')).toHaveCount(
    production.participants.length
  );
  await page.goto('/observatory/watch/');
  await expect(page.getByRole('heading', { name: 'Saved Ecosystem Watch briefing' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Observatory' })).toBeVisible();
  await context.close();
});
