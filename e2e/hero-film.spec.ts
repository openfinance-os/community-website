import { test, expect, type Page } from '@playwright/test';

const filmSelector = '[data-hero-film]';
const videoSelector = '#shared-horizon-video';

function watchFilmRequests(page: Page) {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/media/shared-horizon-hero.mp4') {
      requests.push(request.url());
    }
  });
  return requests;
}

async function expectStillWithoutFetch(page: Page, requests: string[]) {
  const poster = page.locator('.hero-film-poster');
  await expect(poster).toBeVisible();
  await expect
    .poll(() =>
      poster.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)
    )
    .toBe(true);
  // Give the initial intersection callback time to run before checking the request guard.
  await page.waitForTimeout(300);
  await expect(page.locator(videoSelector)).not.toHaveAttribute('src');
  await expect(page.locator(videoSelector)).toHaveCSS('opacity', '0');
  expect(
    await page.locator(videoSelector).evaluate((video: HTMLVideoElement) => video.currentSrc)
  ).toBe('');
  expect(requests).toEqual([]);
}

async function expectPlaying(page: Page) {
  await expect
    .poll(() =>
      page.locator(videoSelector).evaluate((video: HTMLVideoElement) => video.currentTime)
    )
    .toBeGreaterThan(0);
  await expect
    .poll(() => page.locator(videoSelector).evaluate((video: HTMLVideoElement) => video.paused))
    .toBe(false);
}

test.describe('Homepage background film', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  });

  test('automatically plays a silent inline loop without film controls', async ({ page }) => {
    await page.goto('/');
    const video = page.locator(videoSelector);
    await expectPlaying(page);
    expect(
      await video.evaluate((element: HTMLVideoElement) => ({
        muted: element.muted,
        inline: element.hasAttribute('playsinline'),
        loop: element.loop,
        decorative: Boolean(element.closest('[aria-hidden="true"]')),
        tabIndex: element.tabIndex,
        controls: element.controls,
      }))
    ).toEqual({
      muted: true,
      inline: true,
      loop: true,
      decorative: true,
      tabIndex: -1,
      controls: false,
    });
    await expect(
      page.locator(
        '[data-hero-film-control], .hero-film-control, button[aria-controls="shared-horizon-video"]'
      )
    ).toHaveCount(0);
    await expect(page.locator(filmSelector).locator('button')).toHaveCount(0);

    // Exercise the end of the actual media rather than only checking the loop attribute.
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.duration))
      .toBeGreaterThan(1);
    await video.evaluate((element: HTMLVideoElement) => {
      element.currentTime = element.duration - 0.2;
    });
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime))
      .toBeLessThan(2);
    expect(await video.evaluate((element: HTMLVideoElement) => element.ended)).toBe(false);
  });

  test('reduced motion retains a still without fetching the film', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const requests = watchFilmRequests(page);
    await page.goto('/');
    await expectStillWithoutFetch(page, requests);
  });

  test('data-saving preference retains a still without fetching the film', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'connection', {
        configurable: true,
        value: { saveData: true },
      });
    });
    const requests = watchFilmRequests(page);
    await page.goto('/');
    await expectStillWithoutFetch(page, requests);
  });

  test('a narrow viewport automatically plays the muted inline loop', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const requests = watchFilmRequests(page);
    await page.goto('/');
    await expectPlaying(page);
    expect(requests.length).toBeGreaterThan(0);
    expect(
      await page.locator(videoSelector).evaluate((video: HTMLVideoElement) => ({
        muted: video.muted,
        inline: video.hasAttribute('playsinline'),
        loop: video.loop,
      }))
    ).toEqual({ muted: true, inline: true, loop: true });
    // Crossing the old mobile breakpoint must not interrupt automatic playback.
    await page.setViewportSize({ width: 701, height: 1000 });
    await expectPlaying(page);
    await page.setViewportSize({ width: 700, height: 1000 });
    await expectPlaying(page);
  });

  test('failed media retains the still, heading and usable navigation', async ({ page }) => {
    await page.route('**/media/shared-horizon-hero.mp4', (route) => route.abort());
    await page.goto('/');
    await expect
      .poll(() =>
        page.locator(videoSelector).evaluate((video: HTMLVideoElement) => video.error !== null)
      )
      .toBe(true);
    const poster = page.locator('.hero-film-poster');
    await expect(poster).toBeVisible();
    await expect
      .poll(() => poster.evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBeGreaterThan(0);
    await expect(page.locator(videoSelector)).toHaveCSS('opacity', '0');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.getByRole('link', { name: 'Explore the Observatory', exact: true }).click();
    await expect(page).toHaveURL(/\/observatory\/?$/);
  });

  test('pauses offscreen and resumes when the hero returns', async ({ page }) => {
    await page.goto('/');
    await expectPlaying(page);
    const video = page.locator(videoSelector);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
      .toBe(true);
    const stoppedAt = await video.evaluate((element: HTMLVideoElement) => element.currentTime);
    await page.waitForTimeout(300);
    expect(await video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBe(
      stoppedAt
    );
    await page.locator('.hero').scrollIntoViewIfNeeded();
    await expectPlaying(page);
  });

  test('pauses when the page is hidden and automatically resumes when visible', async ({
    page,
  }) => {
    await page.goto('/');
    await expectPlaying(page);
    const video = page.locator(videoSelector);
    const setHidden = async (hidden: boolean) => {
      // A controlled visibility event is portable across Chromium, Firefox and WebKit.
      await page.evaluate((value) => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => value });
        document.dispatchEvent(new Event('visibilitychange'));
      }, hidden);
    };
    await setHidden(true);
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
      .toBe(true);
    await setHidden(false);
    await expectPlaying(page);
  });

  test('motion and data-saving preference changes return the film to its still', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const connection = Object.assign(new EventTarget(), { saveData: false });
      Object.defineProperty(navigator, 'connection', {
        configurable: true,
        value: connection,
      });
    });
    await page.goto('/');
    await expectPlaying(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const video = page.locator(videoSelector);
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
      .toBe(true);
    await expect(video).toHaveCSS('opacity', '0');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expectPlaying(page);
    await page.evaluate(() => {
      const connection = (
        navigator as Navigator & { connection: EventTarget & { saveData: boolean } }
      ).connection;
      connection.saveData = true;
      connection.dispatchEvent(new Event('change'));
    });
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
      .toBe(true);
    await expect(video).toHaveCSS('opacity', '0');
    await page.evaluate(() => {
      const connection = (
        navigator as Navigator & { connection: EventTarget & { saveData: boolean } }
      ).connection;
      connection.saveData = false;
      connection.dispatchEvent(new Event('change'));
    });
    await expectPlaying(page);
  });

  for (const theme of ['light', 'dark'] as const) {
    test(`foreground content remains usable over the fuller film layout in ${theme} mode`, async ({
      page,
    }) => {
      await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
      await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
      for (const width of [320, 700, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto('/');
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expect(page.locator(`.hero ${filmSelector}`)).toBeAttached();
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
          /^\s*Open finance\.\s*In full view\.\s*$/
        );
        await expect(
          page.getByRole('link', { name: 'Explore the Observatory', exact: true })
        ).toBeVisible();
        await expect(
          page.getByRole('link', { name: 'Find your starting point', exact: true })
        ).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width
        );
        await page.getByRole('tab', { name: 'Sandbox', exact: true }).click();
        await expect(page.locator('#directory-panel-sandbox')).toBeVisible();
        await page.getByRole('tab', { name: 'Production', exact: true }).click();
        await expect(page.locator('#directory-panel-production')).toBeVisible();
      }
      await page.getByRole('link', { name: 'Explore the Observatory', exact: true }).click();
      await expect(page).toHaveURL(/\/observatory\/?$/);
    });
  }
});
