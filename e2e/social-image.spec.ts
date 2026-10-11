import { test, expect } from '@playwright/test';

test('default social metadata serves a decodable 1200×630 PNG', async ({ page, request }) => {
  await page.goto('/');
  const metadataURL = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(metadataURL).toBe('https://openfinance-os.org/og-image.png');
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', metadataURL!);

  // Test the URL path in this build; production keeps its canonical origin.
  const asset = new URL(metadataURL!);
  const response = await request.get(asset.pathname + asset.search);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/png');
  const bytes = await response.body();
  expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect(bytes.readUInt32BE(16)).toBe(1200);
  expect(bytes.readUInt32BE(20)).toBe(630);

  const dimensions = await page.evaluate(async (url) => {
    const image = new Image();
    image.src = url;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  }, response.url());
  expect(dimensions).toEqual({ width: 1200, height: 630 });
});
