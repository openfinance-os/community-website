import { expect, test } from '@playwright/test';

const pages = [
  ['/learn/', '/ar/learn/'],
  ['/learn/tpp-guide/', '/ar/learn/tpp-guide/'],
  ['/learn/bank-guide/', '/ar/learn/bank-guide/'],
  ['/learn/api-guide/', '/ar/learn/api-guide/'],
  ['/learn/glossary/', '/ar/learn/glossary/'],
];

test('the Arabic home is right-to-left and links both editions', async ({ page }) => {
  await page.goto('/ar/');
  await expect(page.locator('main')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('main')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', /\/$/);
  await expect(page.locator('link[hreflang="ar"]')).toHaveAttribute('href', /\/ar\/$/);
});

for (const [english, arabic] of pages) {
  test(`${arabic} pairs with ${english}`, async ({ page }) => {
    await page.goto(english);
    await page.locator('.language-switch a').click();
    await expect(page).toHaveURL(new RegExp(`${arabic}$`));
    await expect(page.locator('main')).toHaveAttribute('dir', 'rtl');
    await page.locator('.language-switch a').click();
    await expect(page).toHaveURL(new RegExp(`${english}$`));
  });
}

test('English pages do not download the Arabic font', async ({ page }) => {
  const fonts: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('ibm-plex-sans-arabic')) fonts.push(request.url());
  });
  await page.goto('/learn/tpp-guide/', { waitUntil: 'networkidle' });
  expect(fonts).toEqual([]);
});

test('Arabic pages fit a phone without horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const path of ['/ar/', ...pages.map(([, arabic]) => arabic)]) {
    await page.goto(path);
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width, path).toBeLessThanOrEqual(360);
  }
});
