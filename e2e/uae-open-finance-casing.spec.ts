import { expect, test } from '@playwright/test';

const phrase = 'UAE open finance';
const articlePath = '/news/2026-09-30-uae-open-finance-ai-agents-and-the-price-of-being/';
const articleTitle = 'UAE Open Finance, AI agents and the price of being chosen';

function visibleCopy(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => visibleCopy(item, out));
    return out;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (key === 'searchTerms' || key === 'url') continue;
      visibleCopy(child, out);
    }
  }
  return out;
}

test('rendered titles, descriptions, and the search index use UAE Open Finance', async ({
  page,
}) => {
  await page.goto('/');
  const raw = await page.locator('#search-index-data').textContent();
  expect(raw).toBeTruthy();
  const index = JSON.parse(raw!) as unknown;
  const hits = visibleCopy(index).filter((text) => text.includes(phrase));
  expect(hits).toEqual([]);

  await page.goto(articlePath);
  await expect(page).toHaveTitle(`${articleTitle} | Open Finance OS`);
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  expect(description).toContain(articleTitle);
  expect(description).not.toContain(phrase);
  expect(page.url()).toContain(articlePath);
});
