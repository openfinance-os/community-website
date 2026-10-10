import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { ObservatorySnapshot } from '../scripts/types/participant';
const production = JSON.parse(
  readFileSync(
    new URL('../data/observatory/snapshots/production/latest.json', import.meta.url),
    'utf8'
  )
) as ObservatorySnapshot;
import { participantUrl } from '../src/lib/participant-identity';

test('homepage distinguishes registrations and published metadata', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#directory-panel-production .hero-stat')).toContainText(
    'production directory registrations'
  );
  const coverage = page.locator('.observatory-preview');
  await expect(coverage).toContainText('Distinct registration IDs');
  await expect(coverage).toContainText('Registration does not establish usage');
  await expect(coverage).not.toContainText('Live in Production');
  await page.goto('/observatory');
  await expect(
    page.locator('.stat-card').filter({ hasText: 'Registrations With Issuer' })
  ).toContainText(String(production.summary.liveInProduction));
  await expect(page.locator('.stat-card').filter({ hasText: 'TPP Population' })).toContainText(
    'N/A'
  );
});

test('Mercury registrations have different profiles and the old URL offers a choice', async ({
  page,
}) => {
  const registrations = production.participants.filter((p) => p.name === 'Mercury');
  expect(registrations).toHaveLength(2);
  await page.goto('/observatory/participant/mercury');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('choose a registration');
  for (const registration of registrations) {
    await expect(
      page.locator(`.registration-choices a[href="${participantUrl(registration)}"]`)
    ).toHaveCount(1);
    await page.goto(participantUrl(registration));
    await expect(page.locator('.participant-header')).toContainText(registration.id);
    await expect(page.locator('.roles-grid .role-name')).toHaveText(registration.roles);
    await expect(page.locator('main')).toHaveCount(1);
    await page.goto('/observatory/participant/mercury');
  }
});

test('legacy unique names redirect to the stable registration page', async ({ page }) => {
  const registration = production.participants.find((p) => p.name === 'ADIB')!;
  await page.goto('/observatory/participant/adib');
  await expect(page).toHaveURL(new RegExp(`${registration.id}/?$`));
  await expect(page.locator('.participant-header')).toContainText(registration.id);
});

for (const width of [390, 1440]) {
  test(`search works at ${width}px with correct empty and result states`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Search', exact: true });
    await expect(trigger).toBeVisible();
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const input = page.locator('.search-input');
    await expect(input).toBeFocused();
    await expect(page.locator('.search-empty')).toBeHidden();
    await input.fill('CIBA');
    await expect(dialog.locator('a[href="/learn/glossary#ciba"]')).toBeVisible();
    const result = dialog.locator('a[href="/learn/glossary#ciba"]');
    const titleBox = await result.locator('.result-title').boundingBox();
    const detailBox = await result.locator('.result-desc').boundingBox();
    expect(detailBox!.y).toBeGreaterThanOrEqual(titleBox!.y + titleBox!.height);

    await expect(page.locator('.search-empty')).toBeHidden();
    await expect(page.locator('.search-initial')).toBeHidden();
    await input.fill('zzzzzzzzzzzzzzzzzz');
    await expect(page.locator('.search-empty')).toBeVisible();
    await expect(page.locator('.search-results')).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}

test('search keeps colliding registrations distinct', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  await page.locator('.search-input').fill('Mercury');
  const registrations = production.participants.filter((p) => p.name === 'Mercury');
  for (const registration of registrations) {
    await expect(
      page.locator(`.search-results a[href="${participantUrl(registration)}"]`)
    ).toBeVisible();
  }
});

test('participant resources display every declared version, including additional families', async ({
  page,
}) => {
  const registration = production.participants.find((p) => p.apiFamilies.includes('insurance'));
  expect(
    registration,
    'The refreshed snapshot should retain published insurance resources'
  ).toBeDefined();
  await page.goto(participantUrl(registration!));
  const card = page.locator('.api-card.active').filter({ hasText: 'Insurance' });
  await expect(card).toBeVisible();
  const resources = registration!.apiResources.filter((r) => r.family === 'insurance');
  await expect(card.locator('.api-details')).toHaveCount(resources.length);
});
