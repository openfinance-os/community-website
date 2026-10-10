import { test, expect } from '@playwright/test';

test.describe('Open Circuit hero', () => {
  test('plays silently once and supports keyboard pause and replay', async ({ page }) => {
    await page.goto('/');
    const video = page.locator('#open-circuit-video');
    const pause = page.getByRole('button', { name: 'Pause animation', exact: true });
    await expect(pause).toBeVisible();
    await expect
      .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime))
      .toBeGreaterThan(0);
    expect(
      await video.evaluate((v: HTMLVideoElement) => ({
        muted: v.muted,
        inline: v.playsInline,
        loop: v.loop,
      }))
    ).toEqual({ muted: true, inline: true, loop: false });

    await pause.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Play animation', exact: true })).toBeVisible();
    const stoppedAt = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
    await page.waitForTimeout(350);
    expect(await video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBe(stoppedAt);

    await page.getByRole('button', { name: 'Play animation', exact: true }).click();
    const replay = page.getByRole('button', { name: 'Replay animation', exact: true });
    await expect(replay).toBeVisible({ timeout: 16000 });
    expect(await video.evaluate((v: HTMLVideoElement) => v.ended)).toBe(true);
    await replay.click();
    await expect(pause).toBeVisible();
    expect(await video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeLessThan(3);
  });

  test('shows a still without fetching video when reduced motion is preferred', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const videoRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('open-circuit-hero.mp4')) videoRequests.push(request.url());
    });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Play animation', exact: true })).toBeVisible();
    await expect(page.locator('.circuit-poster')).toBeVisible();
    expect(await page.locator('#open-circuit-video').getAttribute('src')).toBeNull();
    expect(videoRequests).toHaveLength(0);

    await page.getByRole('button', { name: 'Play animation', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pause animation', exact: true })).toBeVisible();
  });

  test('keeps the hero usable when video fails', async ({ page }) => {
    await page.route('**/media/open-circuit-hero.mp4', (route) => route.abort());
    await page.goto('/');
    await expect(page.locator('.circuit-control')).toBeHidden();
    await expect(page.locator('.circuit-poster')).toBeVisible();
    expect(
      await page
        .locator('.circuit-poster')
        .evaluate((image: HTMLImageElement) => image.naturalWidth)
    ).toBeGreaterThan(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Explore the Observatory', exact: true })
    ).toBeVisible();
  });

  test('fits the mobile viewport with the artwork before the description', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const layout = await page.evaluate(() => {
      const art = document.querySelector('.hero-circuit')!.getBoundingClientRect();
      const description = document.querySelector('.hero-tagline')!.getBoundingClientRect();
      return {
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
        artBottom: art.bottom,
        descriptionTop: description.top,
      };
    });
    expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.artBottom).toBeLessThanOrEqual(layout.descriptionTop);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
