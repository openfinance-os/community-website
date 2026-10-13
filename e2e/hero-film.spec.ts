import { test, expect, type Page } from '@playwright/test';

const filmSelector = '[data-hero-film]';
const videoSelector = '#shared-horizon-video';
const playLabel = 'Play background film';
const pauseLabel = 'Pause background film';

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
  await expect(page.getByRole('button', { name: playLabel, exact: true })).toBeVisible();
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
  expect(
    await page.locator(videoSelector).evaluate((video: HTMLVideoElement) => video.currentSrc)
  ).toBe('');
  expect(requests).toEqual([]);
}

async function expectPlaying(page: Page) {
  await expect(page.getByRole('button', { name: pauseLabel, exact: true })).toBeVisible();
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

  test('plays a silent inline loop and supports a persistent keyboard pause', async ({ page }) => {
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
      }))
    ).toEqual({ muted: true, inline: true, loop: true, decorative: true, tabIndex: -1 });

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

    const pause = page.getByRole('button', { name: pauseLabel, exact: true });
    await expect(pause).toHaveAttribute('aria-controls', 'shared-horizon-video');
    await pause.focus();
    await page.keyboard.press('Enter');
    const play = page.getByRole('button', { name: playLabel, exact: true });
    await expect(play).toBeFocused();
    const stoppedAt = await video.evaluate((element: HTMLVideoElement) => element.currentTime);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.locator('.hero').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    expect(await video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBe(
      stoppedAt
    );
    await expect(play).toBeVisible();
    await play.focus();
    await page.keyboard.press('Space');
    await expectPlaying(page);
  });

  test('reduced motion starts with a still and permits explicit playback', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const requests = watchFilmRequests(page);
    await page.goto('/');
    await expectStillWithoutFetch(page, requests);
    await page.getByRole('button', { name: playLabel, exact: true }).click();
    await expectPlaying(page);
    expect(requests.length).toBeGreaterThan(0);
  });

  test('data-saving preference avoids automatic fetch but permits explicit playback', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'connection', {
        configurable: true,
        value: { saveData: true },
      });
    });
    const requests = watchFilmRequests(page);
    await page.goto('/');
    await expectStillWithoutFetch(page, requests);
    await page.getByRole('button', { name: playLabel, exact: true }).click();
    await expectPlaying(page);
    expect(requests.length).toBeGreaterThan(0);
  });

  test('a narrow viewport uses a still until the user requests playback', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const requests = watchFilmRequests(page);
    await page.goto('/');
    await expectStillWithoutFetch(page, requests);
    await page.getByRole('button', { name: playLabel, exact: true }).click();
    await expectPlaying(page);
    expect(requests.length).toBeGreaterThan(0);
  });

  test('automatic playback begins only above the mobile breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 1000 });
    const requests = watchFilmRequests(page);
    await page.goto('/');
    await expectStillWithoutFetch(page, requests);
    await page.setViewportSize({ width: 701, height: 1000 });
    await expectPlaying(page);
    expect(requests.length).toBeGreaterThan(0);
    await page.setViewportSize({ width: 700, height: 1000 });
    await expect
      .poll(() => page.locator(videoSelector).evaluate((video: HTMLVideoElement) => video.paused))
      .toBe(true);
    await expect(page.getByRole('button', { name: playLabel, exact: true })).toBeVisible();
    await expect(page.locator(videoSelector)).toHaveCSS('opacity', '0');
  });

  test('failed media retains the still, heading and usable navigation', async ({ page }) => {
    await page.route('**/media/shared-horizon-hero.mp4', (route) => route.abort());
    await page.goto('/');
    await expect
      .poll(() =>
        page.locator(videoSelector).evaluate((video: HTMLVideoElement) => video.error !== null)
      )
      .toBe(true);
    await expect(page.locator('[data-hero-film-control]')).toBeHidden();
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

  test('pauses on page visibility changes without clearing a user pause', async ({ page }) => {
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
    await page.getByRole('button', { name: pauseLabel, exact: true }).click();
    await setHidden(true);
    await setHidden(false);
    await page.waitForTimeout(300);
    expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
    await expect(page.getByRole('button', { name: playLabel, exact: true })).toBeVisible();
  });

  test('a new reduced-motion preference returns the film to its still', async ({ page }) => {
    await page.goto('/');
    await expectPlaying(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const video = page.locator(videoSelector);
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
      .toBe(true);
    await expect(video).toHaveCSS('opacity', '0');
    await expect(page.getByRole('button', { name: playLabel, exact: true })).toBeVisible();
    await page.getByRole('button', { name: playLabel, exact: true }).click();
    await expectPlaying(page);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForTimeout(100);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
      .toBe(true);
    await expect(video).toHaveCSS('opacity', '0');
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
