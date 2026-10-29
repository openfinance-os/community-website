import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  test(`Watch tooltip follows scrolling and hides offscreen in ${theme} mode`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
    await page.goto('/observatory/watch/');
    const info = page.getByRole('button', { name: 'More information', exact: true }).first();
    const tooltip = info.getByRole('tooltip');
    await info.scrollIntoViewIfNeeded();
    await info.focus();
    await expect(tooltip).toBeVisible();
    await page.evaluate(() => window.scrollBy(0, 150));
    await expect
      .poll(async () => {
        const button = await info.boundingBox();
        const tip = await tooltip.boundingBox();
        return Math.abs(tip!.y - (button!.y + button!.height + 8));
      })
      .toBeLessThanOrEqual(1);
    await page.evaluate(() => window.scrollBy(0, 1000));
    await expect(tooltip).toBeHidden();
    await expect(info).toBeFocused();
  });

  test(`Watch hover tooltip is hoverable and Escape dismisses it in ${theme} mode`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
    await page.goto('/observatory/watch/');
    const info = page.getByRole('button', { name: 'More information', exact: true }).first();
    const tooltip = info.getByRole('tooltip');
    await info.scrollIntoViewIfNeeded();
    await info.hover();
    await expect(info).not.toBeFocused();
    await expect(tooltip).toBeVisible();
    const tip = await tooltip.boundingBox();
    await page.mouse.move(tip!.x + tip!.width / 2, tip!.y + 10, { steps: 5 });
    await expect(tooltip).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tooltip).toBeHidden();
    await expect(info).not.toBeFocused();
    await page.mouse.move(0, 0);
    await info.hover();
    await expect(tooltip).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(tooltip).toBeHidden();
  });

  test(`mobile menu stays reachable in landscape and after resize in ${theme} mode`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 667, height: 375 });
    await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
    await page.goto('/');
    const menu = page.getByRole('button', { name: 'Toggle menu', exact: true });
    const nav = page.getByRole('navigation', { name: 'Mobile navigation', exact: true });
    await menu.click();
    for (const viewport of [
      { width: 667, height: 375 },
      { width: 320, height: 480 },
    ]) {
      await page.setViewportSize(viewport);
      const dimensions = await nav.evaluate((el) => ({
        bottom: el.getBoundingClientRect().bottom,
        clientHeight: el.clientHeight,
        scrollHeight: el.scrollHeight,
      }));
      expect(dimensions.bottom).toBeLessThanOrEqual(viewport.height);
      expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);
      await nav.getByRole('link', { name: 'About', exact: true }).focus();
      const toggle = nav.getByRole('button', {
        name: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
        exact: true,
      });
      // About, then Newsletter, Slack, and GitHub, then the theme control.
      for (let step = 0; step < 6; step += 1) {
        if (await toggle.evaluate((element) => element === document.activeElement)) break;
        await page.keyboard.press('Tab');
      }
      await expect(toggle).toBeFocused();
      const box = await toggle.boundingBox();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    }
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
    await expect(nav).toBeHidden();
  });
}

test('theme actions announce the next mode after system changes, toggling and reload', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const toggle = page.locator('.theme-toggle');
  await expect(toggle).toHaveAccessibleName('Switch to dark mode');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(toggle).toHaveAccessibleName('Switch to light mode');
  await toggle.click();
  await expect(toggle).toHaveAccessibleName('Switch to dark mode');
  await page.reload();
  await expect(toggle).toHaveAccessibleName('Switch to dark mode');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Toggle menu', exact: true }).click();
  const mobileToggle = page.locator('.theme-toggle-mobile');
  await expect(mobileToggle).toHaveAccessibleName('Switch to dark mode');
  await mobileToggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Toggle menu', exact: true }).click();
  await expect(mobileToggle).toHaveAccessibleName('Switch to light mode');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(toggle).toHaveAccessibleName('Switch to light mode');
});
