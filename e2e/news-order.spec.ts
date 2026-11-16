import { test, expect, type Locator, type Page } from '@playwright/test';

async function datetimes(locator: Locator): Promise<number[]> {
  const values = await locator.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('datetime') || '')
  );
  return values.map((value) => Date.parse(value));
}

function isNewestFirst(dates: number[]): boolean {
  return dates.every((date, index) => index === 0 || dates[index - 1] >= date);
}

async function visibleCardDates(page: Page, selector: string): Promise<number[]> {
  return page
    .locator(selector)
    .evaluateAll((elements) =>
      elements
        .filter((element) => (element as HTMLElement).style.display !== 'none')
        .map((element) => Date.parse(element.querySelector('time')?.getAttribute('datetime') || ''))
    );
}

test.describe('combined news order', () => {
  test('updates shows one newest-first list and filters it', async ({ page }) => {
    await page.goto('/updates/');

    await expect(page.getByRole('heading', { name: 'External coverage' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'From Open Finance OS' })).toHaveCount(0);

    const dates = await datetimes(page.locator('#news-grid time'));
    expect(dates.length).toBeGreaterThan(10);
    expect(isNewestFirst(dates)).toBe(true);

    const origins = await page
      .locator('#news-grid .news-card')
      .evaluateAll((elements) => elements.map((element) => element.getAttribute('data-origin')));
    expect(origins).toContain('external');
    expect(origins.some((origin) => origin === 'digest' || origin === 'analysis')).toBe(true);
    const ownIndex = origins.findIndex((origin) => origin !== 'external');
    const externalIndex = origins.indexOf('external');
    if (dates[ownIndex] !== dates[externalIndex]) {
      const newerIndex = dates[ownIndex] > dates[externalIndex] ? ownIndex : externalIndex;
      expect(Math.min(ownIndex, externalIndex)).toBe(newerIndex);
    }

    const firstCard = page.locator('#news-grid .news-card').first();
    await expect(firstCard.locator('.author')).toHaveText(/Analysis ·|Weekly digest ·|via /);

    await page.locator('.news-filter [data-news-type="opinion"]').click();
    const opinionDates = await visibleCardDates(page, '#news-grid > [data-news-type]');
    const hiddenOtherTypes = await page
      .locator('#news-grid > [data-news-type]')
      .evaluateAll((elements) =>
        elements
          .filter((element) => element.getAttribute('data-news-type') !== 'opinion')
          .every((element) => (element as HTMLElement).style.display === 'none')
      );
    expect(opinionDates.length).toBeGreaterThan(0);
    expect(isNewestFirst(opinionDates)).toBe(true);
    expect(hiddenOtherTypes).toBe(true);

    await page.locator('.region-filter [data-news-region="global"]').click();
    const globalOpinion = await page
      .locator('#news-grid > [data-news-type]')
      .evaluateAll((elements) =>
        elements.map((element) => ({
          type: element.getAttribute('data-news-type'),
          region: element.getAttribute('data-news-region'),
          hidden: (element as HTMLElement).style.display === 'none',
        }))
      );
    const shown = globalOpinion.filter((card) => !card.hidden);
    expect(shown.length).toBeGreaterThan(0);
    expect(shown.every((card) => card.type === 'opinion' && card.region === 'global')).toBe(true);
    expect(globalOpinion.filter((card) => card.hidden).length).toBeGreaterThan(0);
  });

  test('news index hero is the newest item and the grid stays filterable', async ({ page }) => {
    await page.goto('/news/');

    await expect(page.getByRole('heading', { name: 'External coverage' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'From Open Finance OS' })).toHaveCount(0);

    const featured = Date.parse(
      (await page.locator('.featured-card time').getAttribute('datetime')) || ''
    );
    const gridDates = await datetimes(page.locator('#news-grid time'));
    expect(gridDates.length).toBeGreaterThan(10);
    expect(featured).toBeGreaterThanOrEqual(gridDates[0]);
    expect(isNewestFirst(gridDates)).toBe(true);
    await expect(page.locator('.featured-author')).toHaveText(/Analysis ·|Weekly digest ·|via /);

    const origins = await page
      .locator('#news-grid .news-card')
      .evaluateAll((elements) => elements.map((element) => element.getAttribute('data-origin')));
    expect(origins).toContain('external');
    expect(origins.some((origin) => origin === 'digest' || origin === 'analysis')).toBe(true);

    await page.locator('.news-filter [data-filter-type="official"]').click();
    const shown = await page
      .locator('#news-grid .news-card')
      .evaluateAll((elements) =>
        elements
          .filter((element) => (element as HTMLElement).style.display !== 'none')
          .map((element) => element.getAttribute('data-type'))
      );
    const hidden = await page
      .locator('#news-grid .news-card')
      .evaluateAll(
        (elements) =>
          elements.filter((element) => (element as HTMLElement).style.display === 'none').length
      );
    expect(shown.length).toBeGreaterThan(0);
    expect(shown.every((type) => type === 'official')).toBe(true);
    expect(hidden).toBeGreaterThan(0);
  });

  test('homepage latest news is the same newest-first mix', async ({ page }) => {
    await page.goto('/');

    const dates = await datetimes(page.locator('.latest-news-section time'));
    expect(dates).toHaveLength(4);
    expect(isNewestFirst(dates)).toBe(true);

    const cards = page.locator('.latest-news-section .news-card');
    await expect(cards.first().locator('.author')).toHaveText(/Analysis ·|Weekly digest ·|via /);
    const origins = await cards.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('data-origin'))
    );
    expect(
      origins.every((origin) => ['external', 'digest', 'analysis'].includes(origin || ''))
    ).toBe(true);

    await page.goto('/updates/');
    const updatesFirst = await page.locator('#news-grid time').first().getAttribute('datetime');
    expect(Date.parse(updatesFirst || '')).toBe(dates[0]);
  });
});
