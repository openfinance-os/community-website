import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  for (const width of [320, 390, 720, 768, 1440]) {
    test(`directory notes and changelog rows fit at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
      for (const path of ['/observatory/', '/observatory/sandbox/']) {
        await page.goto(path);
        const layout = await page.evaluate(() => {
          const note = document.querySelector('.measurement-note')!.getBoundingClientRect();
          const cards = document.querySelector('.stats-grid')!.getBoundingClientRect();
          return {
            noteLeft: note.left,
            cardsLeft: cards.left,
            noteRight: note.right,
            cardsRight: cards.right,
            gap: cards.top - note.bottom,
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
        expect(layout.noteLeft).toBeCloseTo(layout.cardsLeft, 0);
        expect(layout.noteRight).toBeLessThanOrEqual(layout.cardsRight + 1);
        expect(layout.gap).toBeGreaterThanOrEqual(16);
        expect(layout.overflow).toBe(false);
      }
      for (const path of ['/', '/observatory/']) {
        await page.goto(path);
        const rows = page.locator('.registry-event');
        expect(await rows.count()).toBeGreaterThan(0);
        const overlappingRows = await rows.evaluateAll(
          (elements) =>
            elements.filter((row) => {
              const chip = row.querySelector('.event-chip')!.getBoundingClientRect();
              const name = row.querySelector('.event-name')!.getBoundingClientRect();
              return (
                Math.min(chip.right, name.right) - Math.max(chip.left, name.left) > 1 &&
                Math.min(chip.bottom, name.bottom) - Math.max(chip.top, name.top) > 1
              );
            }).length
        );
        expect(overlappingRows).toBe(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true
        );
      }
    });
  }

  test(`HSBC popup preserves declarations and supports keyboard and touch in ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
    const dataset = await (
      await page.request.get('/observatory/data/registry-changelog.json')
    ).json();
    const event = dataset.events.find(
      (entry: { type: string; name: string; date: string }) =>
        entry.type === 'resource_changed' && entry.name === 'HSBC' && entry.date === '2026-10-08'
    );
    const declarations = /^Before: (.*?)\. After: (.*?)\.$/s.exec(event.detail)!;
    for (const path of ['/', '/observatory/']) {
      await page.goto(path);
      const row = page
        .locator('.registry-event[data-event-type="resource_changed"]')
        .filter({
          has: page.locator('.event-name', { hasText: 'HSBC' }),
        })
        .first();
      await expect(row.locator('.event-description')).toContainText('ATM v2.1 added.');
      const trigger = row.getByRole('button', { name: /View change for HSBC/ });
      const dialog = page.getByRole('dialog', { name: 'HSBC — resource change' });
      await expect(dialog).toBeHidden();
      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole('button', { name: 'Close change details for HSBC' })
      ).toBeFocused();
      await expect(dialog.locator('section').nth(0).locator('li')).toHaveText(
        declarations[1].split(' | ')
      );
      await expect(dialog.locator('section').nth(1).locator('li')).toHaveText(
        declarations[2].split(' | ')
      );
      const bounds = await dialog.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.y).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
      expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
        true
      );
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      await trigger.click();
      await expect(dialog).toBeVisible();
      await dialog.getByRole('button', { name: 'Close change details for HSBC' }).click();
      await expect(dialog).toBeHidden();
      await trigger.click();
      await page.mouse.click(4, 4);
      await expect(dialog).toBeHidden();
    }
  });
}

test('change details remain available without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/observatory/');
    await page
      .getByRole('button', { name: /View change for HSBC, observed 8 October 2026/ })
      .click();
    const dialog = page.getByRole('dialog', { name: 'HSBC — resource change' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('section').nth(1)).toContainText(
      'atm v2.1; certification=Self-Certified; complete=true'
    );
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  } finally {
    await context.close();
  }
});
