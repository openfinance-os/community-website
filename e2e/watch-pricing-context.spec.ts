import { test, expect } from '@playwright/test';

test('Watch explains missing billing context and withholds speculative fee totals', async ({
  page,
}) => {
  await page.goto('/observatory/watch/');
  const economics = page.locator('#economics');
  await expect(economics.getByRole('heading', { name: 'Fee estimates unavailable' })).toBeVisible();
  await expect(economics).toContainText('exact timing');
  await expect(economics).toContainText('exemptions');
  await expect(
    economics.getByRole('link', { name: 'Commercial & Pricing Model v1.0' })
  ).toHaveAttribute(
    'href',
    'https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/124846096/Commercial+and+Pricing+Model'
  );
  await expect(economics).not.toContainText('Top TPP by cost');
  await expect(economics).not.toContainText('LFI income — payment scheme fees');
});
