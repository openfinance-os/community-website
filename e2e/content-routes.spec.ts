import { test, expect } from '@playwright/test';

test('RSS article links resolve to published news pages', async ({ page, request }) => {
  const feed = await request.get('/rss.xml');
  expect(feed.ok()).toBe(true);
  const paths = await page.evaluate(
    (xml) => {
      const document = new DOMParser().parseFromString(xml, 'text/xml');
      return [...document.querySelectorAll('item > link')].map(
        (link) => new URL(link.textContent!).pathname
      );
    },
    await feed.text()
  );
  expect(paths.length).toBeGreaterThan(0);
  expect(new Set(paths).size).toBe(paths.length);
  for (const path of paths) {
    expect(path).toMatch(/^\/news\/[^/]+\/$/);
    expect(path).not.toContain('undefined');
    const article = await request.get(path);
    expect(article.status(), path).toBe(200);
  }
});

for (const content of [
  {
    title: 'Flutterwave expands open banking with Mono acquisition',
    path: '/news/2026-01-06-flutterwave-expands-open-banking-with-mono-acquisi',
    body: '.article-content',
    text: 'Flutterwave acquires Nigerian open banking startup Mono',
  },
  {
    title: 'Open Finance Data Sandbox',
    path: '/commons/data-sandbox',
    body: '.prose',
    text: 'synthetic',
  },
]) {
  test(`search opens rendered content for ${content.title}`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.locator('.search-input').fill(content.title);
    await page.locator(`.search-results a[href="${content.path}"]`).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(content.title);
    await expect(page.locator(content.body)).toContainText(content.text);
  });
}
