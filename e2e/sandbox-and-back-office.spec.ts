import { test, expect } from '@playwright/test';

test('homepage teasers lead to the sample explorer and the back-office page', async ({ page }) => {
  await page.goto('/');
  const teaser = page.locator('.sandbox-teaser');
  await expect(teaser.getByRole('tabpanel')).toContainText('SYNTHETIC — Open Finance Data Sandbox');
  await teaser.getByRole('tab', { name: 'Omar' }).click();
  await expect(teaser.getByRole('tabpanel')).toContainText('persona:motor_comprehensive_mid');
  await expect(teaser.getByRole('link', { name: /Explore sample data/ })).toHaveAttribute(
    'href',
    '/data-sandbox'
  );
  await expect(
    page.locator('.bo-teaser').getByRole('link', { name: /See the back-office requirements/ })
  ).toHaveAttribute('href', '/learn/back-office');
});

test('sample explorer switches persona and payload and keeps the watermark', async ({ page }) => {
  await page.goto('/data-sandbox/');
  const explorer = page.locator('[data-sandbox-explorer]');
  await expect(explorer.locator('.sbx-watermark:visible')).toContainText(
    'persona:salaried_expat_mid lfi:median seed:4729'
  );

  await explorer.getByRole('tab', { name: 'Transactions' }).click();
  await expect(explorer.locator('.sbx-view:visible')).toContainText('SAL/PAYROLL');

  await explorer.getByRole('tab', { name: /Karim/ }).click();
  await expect(explorer.locator('.sbx-watermark:visible')).toContainText(
    'persona:sme_cash_heavy lfi:median seed:6308'
  );
  const open = explorer.getByRole('link', { name: /Open Karim in the full sandbox/ });
  await expect(open).toHaveAttribute('href', /persona=sme_cash_heavy&lfi=median&seed=6308/);

  // No registry install commands until the packages are published.
  await expect(page.locator('main')).not.toContainText(/npm install|pip install/);
});

test('back-office page filters requirements by role', async ({ page }) => {
  await page.goto('/learn/back-office/');
  const first = page.locator('.area').first();
  await expect(first.getByRole('heading', { name: 'As an LFI' })).toBeVisible();
  await expect(first.getByRole('heading', { name: 'As a TPP' })).toBeVisible();

  await page.getByRole('button', { name: 'TPP', exact: true }).click();
  await expect(first.getByRole('heading', { name: 'As an LFI' })).toBeHidden();
  await expect(first.getByRole('heading', { name: 'As a TPP' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'TPP', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
});
