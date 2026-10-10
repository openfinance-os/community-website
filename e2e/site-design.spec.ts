import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const routes = [
  '/observatory/',
  '/observatory/sandbox/',
  '/commons/',
  '/news/',
  '/observatory/methodology/',
  '/observatory/watch/',
];
for (const theme of ['light', 'dark'] as const) {
  for (const width of [320, 390, 768, 1440]) {
    test(`interior content fits ${width}px in ${theme} mode`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
      for (const route of routes) {
        await page.goto(route);
        await expect(page.locator('main h1').first()).toBeVisible();
        const dimensions = await page.evaluate(() => ({
          width: document.documentElement.scrollWidth,
          viewport: innerWidth,
        }));
        expect(dimensions.width, route).toBeLessThanOrEqual(dimensions.viewport + 1);
      }
    });
  }
}

test('Watch uses shared navigation, search, theme persistence and founder credit', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/observatory/watch/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('.theme-toggle').first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(
    page.locator('footer').getByRole('link', { name: 'MiddleLeap', exact: true })
  ).toBeVisible();
  await expect(page.locator('nav[aria-label="Observatory"] [aria-current="page"]')).toHaveText(
    'Full Watch'
  );
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.locator('.search-input')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeFocused();
  await expect(page.locator('#operations')).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://openfinance-os.org/observatory/watch/'
  );
});

for (const theme of ['light', 'dark']) {
  test(`Commons contribution code remains readable and copyable in ${theme} mode`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((value) => {
      localStorage.setItem('theme', value);
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: async (text: string) => {
            (window as any).copiedCode = text;
          },
        },
      });
    }, theme);
    await page.goto('/commons/contribute/');
    const panel = page.locator('.code-block');
    await expect(panel).toBeVisible();
    const code = await panel.locator('code').textContent();
    await panel.getByRole('button', { name: 'Copy', exact: true }).click();
    await expect.poll(() => page.evaluate(() => (window as any).copiedCode)).toBe(code);
    await expect(panel.getByRole('button', { name: 'Copied!' })).toBeVisible();
  });
}

for (const theme of ['light', 'dark'] as const) {
  test(`Watch information is legible and stays in the mobile viewport in ${theme} mode`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
    await page.goto('/observatory/watch/');
    const info = page.getByRole('button', { name: 'More information', exact: true }).first();
    await info.scrollIntoViewIfNeeded();
    await info.hover();
    await info.focus();
    const tooltip = page.getByRole('tooltip').first();
    await expect(tooltip).toBeVisible();
    const box = await tooltip.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(900);
    const contrast = await tooltip.evaluate((el) => {
      const style = getComputedStyle(el);
      const luminance = (color: string) =>
        color
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number)
          .map((x) => x / 255)
          .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
          .reduce((sum, x, i) => sum + x * [0.2126, 0.7152, 0.0722][i], 0);
      const text = luminance(style.color),
        background = luminance(style.backgroundColor);
      return (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
    await page.keyboard.press('Escape');
    await expect(tooltip).toBeHidden();
    await expect(info).toBeFocused();
  });
}

for (const theme of ['light', 'dark'] as const) {
  test(`chart labels and unexposed capabilities remain readable in ${theme} mode`, async ({
    page,
  }) => {
    await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
    const snapshot = JSON.parse(
      readFileSync(
        new URL('../data/observatory/snapshots/production/latest.json', import.meta.url),
        'utf8'
      )
    );
    for (const [route, selector] of [
      [
        '/observatory/',
        '.axis-label, .capability-item.zero-state .name-abbr, .capability-item.zero-state .capability-description',
      ],
      [
        `/observatory/participant/${snapshot.participants[0].id}/`,
        '.api-card:not(.active) .api-description, .auth-item:not(.active) .auth-description',
      ],
    ]) {
      await page.goto(route);
      const labels = page.locator(selector);
      expect(await labels.count()).toBeGreaterThan(0);
      const ratios = await labels.evaluateAll((elements) =>
        elements.map((el) => {
          const rgb = (value: string) =>
            value
              .match(/[\d.]+/g)!
              .slice(0, 3)
              .map(Number);
          let background = [255, 255, 255];
          for (let parent: Element | null = el; parent; parent = parent.parentElement) {
            const value = getComputedStyle(parent).backgroundColor;
            if (!value.endsWith(', 0)') && value !== 'transparent') {
              background = rgb(value);
              break;
            }
          }
          const style = getComputedStyle(el);
          const text = rgb(el instanceof SVGElement ? style.fill : style.color);
          let opacity = 1;
          for (let parent: Element | null = el; parent; parent = parent.parentElement)
            opacity *= Number(getComputedStyle(parent).opacity);
          const rendered = text.map((value, i) => value * opacity + background[i] * (1 - opacity));
          const luminance = (color: number[]) =>
            color
              .map((x) => x / 255)
              .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
              .reduce((sum, x, i) => sum + x * [0.2126, 0.7152, 0.0722][i], 0);
          const a = luminance(rendered),
            b = luminance(background);
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        })
      );
      for (const ratio of ratios) expect(ratio, route).toBeGreaterThanOrEqual(4.5);
    }
  });
}

for (const theme of ['light', 'dark'] as const) {
  test(`keyboard search selection stays visible in ${theme} mode`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
    await page.goto('/observatory/');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    const input = page.locator('.search-input');
    await expect(input).toBeFocused();
    await input.fill('Coverage');
    const result = page.locator('.result-item').first();
    await expect(result).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await expect(result).toBeFocused();
    const ring = await result.evaluate((el) => {
      const style = getComputedStyle(el);
      return { width: parseFloat(style.outlineWidth), style: style.outlineStyle };
    });
    expect(ring.width).toBeGreaterThanOrEqual(2);
    expect(ring.style).toBe('solid');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeFocused();
  });
}
