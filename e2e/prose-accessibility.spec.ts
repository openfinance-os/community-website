import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  test(`prose references have a visible link cue in ${theme} mode`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
    for (const [route, selector] of [
      ['/', '.data-disclaimer a, .briefing-next a'],
      ['/observatory/', '.measurement-note a, .disclaimer p a'],
      ['/observatory/watch/', '.watch-page .foot a, .watch-page .note a'],
    ]) {
      await page.goto(route);
      const links = page.locator(selector);
      expect(await links.count()).toBeGreaterThan(0);
      const cues = await links.evaluateAll((elements) =>
        elements.map((el) => getComputedStyle(el).textDecorationLine)
      );
      for (const cue of cues) expect(cue, route).toContain('underline');
    }
  });

  test(`glossary and news headings retain their reading structure in ${theme} mode`, async ({
    page,
  }) => {
    await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
    await page.goto('/learn/');
    const terms = page.locator('.glossary-term');
    expect(await terms.count()).toBeGreaterThan(0);
    expect(
      await terms.evaluateAll((elements) =>
        elements.every((el) => {
          const group = el.parentElement;
          return (
            group?.parentElement?.tagName === 'DL' &&
            el.tagName === 'DT' &&
            el.nextElementSibling?.tagName === 'DD'
          );
        })
      )
    ).toBe(true);
    await page.goto('/updates/');
    await expect(page.locator('.news-card h2.card-title').first()).toBeVisible();
    await expect(page.locator('.news-card h3.card-title')).toHaveCount(0);
    await page.goto('/');
    await expect(page.locator('.news-card h3.card-title').first()).toBeVisible();
  });
}
