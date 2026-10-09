import { test, expect } from '@playwright/test';

const proposalSlugs = [
  'ai-conformance-review-action',
  'cbuae-ai-rules',
  'open-finance-context-pack',
  'open-finance-directory-mcp',
  'tpp-onboarding-agent',
];

test('unverified proposal tools have no public routes or search entries', async ({
  page,
  request,
}) => {
  for (const slug of proposalSlugs) {
    const response = await request.get(`/commons/${slug}/`);
    expect(response.status(), slug).toBe(404);
  }
  await page.goto('/commons/');
  const html = await page.content();
  for (const slug of proposalSlugs) expect(html).not.toContain(`/commons/${slug}`);
  expect(html).not.toContain('https://mcp.openfinance.ae/');
  expect(html).not.toContain('openfinance-os/ai-conformance-action@v1');
});

test('AI filter gives an empty state and reset restores published contributions', async ({
  page,
}) => {
  await page.goto('/commons/');
  const cards = page.locator('.contribution-card:visible');
  const initialCount = await cards.count();
  expect(initialCount).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'AI Developer Tools', exact: true }).click();
  await expect(cards).toHaveCount(0);
  await expect(page.locator('.no-results')).toBeVisible();
  await page.locator('.reset-filters').click();
  await expect(cards).toHaveCount(initialCount);
  await expect(page.locator('.no-results')).toBeHidden();
});
