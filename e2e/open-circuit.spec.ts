import { test, expect } from '@playwright/test';

test.describe('Permission connection section', () => {
  test('plays silently once and supports keyboard pause and replay', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-open-circuit]').scrollIntoViewIfNeeded();
    const video = page.locator('#open-circuit-video');
    await expect(video).toHaveAttribute('data-src', '/media/permission-connection.mp4');
    const pause = page.getByRole('button', { name: 'Pause animation', exact: true });
    await expect(pause).toBeVisible();
    await expect
      .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime))
      .toBeGreaterThan(0);
    expect(
      await video.evaluate((v: HTMLVideoElement) => ({
        muted: v.muted,
        inline: v.hasAttribute('playsinline'),
        loop: v.loop,
      }))
    ).toEqual({ muted: true, inline: true, loop: false });
    const media = await video.evaluate((v: HTMLVideoElement) => ({
      duration: v.duration,
      width: v.videoWidth,
      height: v.videoHeight,
      source: new URL(v.currentSrc).pathname,
    }));
    expect(media.duration).toBeGreaterThanOrEqual(7.9);
    expect(media.duration).toBeLessThanOrEqual(8.1);
    expect(media).toMatchObject({
      width: 1920,
      height: 1080,
      source: '/media/permission-connection.mp4',
    });

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
      if (request.url().includes('permission-connection.mp4')) videoRequests.push(request.url());
    });
    await page.goto('/');
    await page.locator('[data-open-circuit]').scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: 'Play animation', exact: true })).toBeVisible();
    await expect(page.locator('.circuit-poster')).toBeVisible();
    expect(await page.locator('#open-circuit-video').getAttribute('src')).toBeNull();
    expect(videoRequests).toHaveLength(0);

    await page.getByRole('button', { name: 'Play animation', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pause animation', exact: true })).toBeVisible();
  });

  test('keeps the hero usable when video fails', async ({ page }) => {
    await page.route('**/media/permission-connection.mp4', (route) => route.abort());
    await page.goto('/');
    await page.locator('[data-open-circuit]').scrollIntoViewIfNeeded();
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

  test('fits the mobile viewport below the purpose headline', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('[data-open-circuit]').scrollIntoViewIfNeeded();
    const layout = await page.evaluate(() => {
      const art = document.querySelector('.hero-circuit')!.getBoundingClientRect();
      const hero = document.querySelector('.hero')!.getBoundingClientRect();
      return {
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
        artTop: art.top,
        heroBottom: hero.bottom,
      };
    });
    expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.artTop).toBeGreaterThanOrEqual(layout.heroBottom);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test('animation waits for visibility and pauses when scrolled away', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const video = page.locator('#open-circuit-video');
  await expect(video).not.toHaveAttribute('src');
  await page.locator('.hero-circuit').scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Pause animation', exact: true })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});

for (const theme of ['light', 'dark'] as const) {
  test(`mobile poster downloads a proportionate image in ${theme} mode`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
    const originalRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().endsWith('/media/permission-connection-poster.webp'))
        originalRequests.push(request.url());
    });
    await page.goto('/');
    const poster = page.locator('.circuit-poster');
    await poster.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        poster.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)
      )
      .toBe(true);
    const source = await poster.evaluate((image: HTMLImageElement) => image.currentSrc);
    const response = await page.request.get(source);
    expect(response.status()).toBe(200);
    // The 320px photographic WebP measures 11,834 bytes at 390px / 1x in all three engines.
    // Keep a ceiling below the 21,930-byte 480px variant so mobile cannot overfetch it.
    expect((await response.body()).length).toBeLessThan(16000);
    const dimensions = await poster.evaluate(async (image: HTMLImageElement) => {
      const bitmap = await createImageBitmap(await (await fetch(image.currentSrc)).blob());
      const box = image.getBoundingClientRect();
      const dimensions = { source: bitmap.width, displayed: box.width, dpr: devicePixelRatio };
      bitmap.close();
      return dimensions;
    });
    expect(dimensions.source).toBeLessThan(1440);
    expect(dimensions.source).toBeLessThanOrEqual(dimensions.displayed * dimensions.dpr * 1.3);
    expect(originalRequests).toEqual([]);
    await expect(page.locator('#open-circuit-video')).not.toHaveAttribute('src');
    await expect(page.getByRole('button', { name: 'Play animation', exact: true })).toBeVisible();
  });
}

test('preference changes pause the permission film and restore its still', async ({ page }) => {
  await page.addInitScript(() => {
    const connection = Object.assign(new EventTarget(), { saveData: false });
    Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
  });
  await page.goto('/');
  await page.locator('[data-open-circuit]').scrollIntoViewIfNeeded();
  const video = page.locator('#open-circuit-video');
  const pause = page.getByRole('button', { name: 'Pause animation', exact: true });
  await expect(pause).toBeVisible();
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime))
    .toBeGreaterThan(0);

  await page.evaluate(() => {
    const connection = (
      navigator as Navigator & { connection: EventTarget & { saveData: boolean } }
    ).connection;
    connection.saveData = true;
    connection.dispatchEvent(new Event('change'));
  });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(video).toHaveCSS('opacity', '0');
  await expect(page.locator('.circuit-poster')).toBeVisible();

  await page.evaluate(() => {
    const connection = (
      navigator as Navigator & { connection: EventTarget & { saveData: boolean } }
    ).connection;
    connection.saveData = false;
    connection.dispatchEvent(new Event('change'));
  });
  await expect(pause).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(video).toHaveCSS('opacity', '0');
  await expect(page.locator('.circuit-poster')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(pause).toBeVisible();
});

for (const theme of ['light', 'dark'] as const) {
  test(`permission scene keeps its complete wide frame in ${theme} mode`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const poster = page.locator('.circuit-poster');
      await poster.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          poster.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)
        )
        .toBe(true);
      const frame = await page.locator('.circuit-media').evaluate((element) => {
        const media = element.getBoundingClientRect();
        const poster = element.querySelector('.circuit-poster')!.getBoundingClientRect();
        const video = element.querySelector('.circuit-video')!.getBoundingClientRect();
        const box = ({ x, y, width, height }: DOMRect) => ({ x, y, width, height });
        return {
          media: box(media),
          poster: box(poster),
          video: box(video),
          pageWidth: document.documentElement.scrollWidth,
          viewportWidth: innerWidth,
        };
      });
      expect(frame.pageWidth).toBeLessThanOrEqual(frame.viewportWidth);
      expect(frame.media.width / frame.media.height).toBeCloseTo(16 / 9, 2);
      expect(frame.media.x).toBeGreaterThanOrEqual(0);
      expect(frame.media.x + frame.media.width).toBeLessThanOrEqual(width);
      for (const artwork of [frame.poster, frame.video]) {
        expect(Math.abs(artwork.x - frame.media.x)).toBeLessThanOrEqual(1);
        expect(Math.abs(artwork.y - frame.media.y)).toBeLessThanOrEqual(1);
        expect(Math.abs(artwork.width - frame.media.width)).toBeLessThanOrEqual(1);
        expect(Math.abs(artwork.height - frame.media.height)).toBeLessThanOrEqual(1);
      }
      await expect(
        page.getByRole('heading', { name: 'Connected through permission.' })
      ).toBeVisible();
      await expect(page.getByRole('link', { name: 'Understand the framework' })).toHaveAttribute(
        'href',
        '/learn'
      );
    }
  });
}
