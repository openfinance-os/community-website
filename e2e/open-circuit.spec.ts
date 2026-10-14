import { test, expect, type Locator } from '@playwright/test';

async function expectPlaying(video: Locator) {
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime))
    .toBeGreaterThan(0);
}

test.describe('Permission connection section', () => {
  test('automatically plays a silent inline loop without animation controls', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/');
    const circuit = page.locator('[data-open-circuit]');
    await circuit.scrollIntoViewIfNeeded();
    const video = page.locator('#open-circuit-video');
    await expect(video).toHaveAttribute('data-src', '/media/permission-connection.mp4');
    await expectPlaying(video);
    expect(
      await video.evaluate((v: HTMLVideoElement) => ({
        muted: v.muted,
        inline: v.hasAttribute('playsinline'),
        loop: v.loop,
        controls: v.controls,
        decorative: Boolean(v.closest('[aria-hidden="true"]')),
        tabIndex: v.tabIndex,
      }))
    ).toEqual({
      muted: true,
      inline: true,
      loop: true,
      controls: false,
      decorative: true,
      tabIndex: -1,
    });
    await expect(
      circuit.locator('.circuit-control, button[aria-controls="open-circuit-video"]')
    ).toHaveCount(0);
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

    // Seek near the end to exercise a real automatic wrap, not just the loop attribute.
    await video.evaluate((v: HTMLVideoElement) => {
      v.currentTime = v.duration - 0.2;
    });
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeLessThan(2);
    expect(await video.evaluate((v: HTMLVideoElement) => v.ended)).toBe(false);
    await expectPlaying(video);
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
    await expect(page.locator('.circuit-poster')).toBeVisible();
    const video = page.locator('#open-circuit-video');
    // Let the intersection callback run before checking the request guard.
    await page.waitForTimeout(300);
    await expect(video).not.toHaveAttribute('src');
    await expect(video).toHaveCSS('opacity', '0');
    expect(videoRequests).toHaveLength(0);
    await expect(page.locator('.circuit-control')).toHaveCount(0);
  });

  test('keeps the hero usable when video fails', async ({ page }) => {
    await page.route('**/media/permission-connection.mp4', (route) => route.abort());
    await page.goto('/');
    await page.locator('[data-open-circuit]').scrollIntoViewIfNeeded();
    const video = page.locator('#open-circuit-video');
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.error !== null)).toBe(true);
    await expect(video).toHaveCSS('opacity', '0');
    await expect(page.locator('.circuit-poster')).toBeVisible();
    await expect
      .poll(() =>
        page.locator('.circuit-poster').evaluate((image: HTMLImageElement) => image.naturalWidth)
      )
      .toBeGreaterThan(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Explore the Observatory', exact: true })
    ).toBeVisible();
  });

  test('automatically plays the muted inline loop within the mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.locator('[data-open-circuit]').scrollIntoViewIfNeeded();
    const video = page.locator('#open-circuit-video');
    await expectPlaying(video);
    expect(
      await video.evaluate((v: HTMLVideoElement) => ({
        muted: v.muted,
        inline: v.hasAttribute('playsinline'),
        loop: v.loop,
      }))
    ).toEqual({ muted: true, inline: true, loop: true });
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

test('the loop waits for visibility and pauses offscreen or when the page is hidden', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const video = page.locator('#open-circuit-video');
  await expect(video).not.toHaveAttribute('src');
  await page.locator('.hero-circuit').scrollIntoViewIfNeeded();
  await expectPlaying(video);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  const stoppedAt = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
  await page.waitForTimeout(300);
  expect(await video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBe(stoppedAt);
  await page.locator('.hero-circuit').scrollIntoViewIfNeeded();
  await expectPlaying(video);

  // Controlled visibility events are portable across Chromium, Firefox and WebKit.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expectPlaying(video);
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
    const dimensions = await poster.evaluate(async (image: HTMLImageElement) => {
      const bitmap = await createImageBitmap(await (await fetch(image.currentSrc)).blob());
      const box = image.getBoundingClientRect();
      const dimensions = { source: bitmap.width, displayed: box.width, dpr: devicePixelRatio };
      bitmap.close();
      return dimensions;
    });
    // Measured downloads: 320px / 1x is 11,834 bytes; Safari's 640px / 2x is 34,400.
    // Each ceiling stays below its next candidate (480px: 21,930; 960px: 61,918).
    const byteBudget = dimensions.dpr === 1 ? 16000 : 40000;
    expect((await response.body()).length).toBeLessThan(byteBudget);
    expect(dimensions.source).toBeLessThan(1440);
    expect(dimensions.source).toBeLessThanOrEqual(dimensions.displayed * dimensions.dpr * 1.3);
    expect(originalRequests).toEqual([]);
    await expect(page.locator('#open-circuit-video')).not.toHaveAttribute('src');
    await expect(page.locator('.circuit-control')).toHaveCount(0);
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
  await expectPlaying(video);

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
  await expectPlaying(video);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(video).toHaveCSS('opacity', '0');
  await expect(page.locator('.circuit-poster')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expectPlaying(video);
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
