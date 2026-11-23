import { test, expect } from '@playwright/test';

const areaIds = [
  'proposition',
  'role',
  'capabilities',
  'journey',
  'partners',
  'controls',
  'operations',
  'delivery',
];

test('readiness remains usable and printable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/learn/readiness/');
    const worksheet = page.locator('[data-worksheet]');
    await expect(worksheet.locator('[data-worksheet-area]')).toHaveCount(areaIds.length);
    await expect(worksheet).not.toHaveClass(/worksheet-enhanced/);
    await expect(page.locator('[data-print-worksheet]').first()).toBeHidden();
    await expect(worksheet.locator('[data-expand-worksheet]')).toBeHidden();

    for (const media of ['screen', 'print'] as const) {
      await page.emulateMedia({ media });
      for (const id of areaIds) {
        const area = worksheet.locator(`#${id}`);
        await expect(area.locator('h3')).toBeVisible();
        await expect(area.locator('.area-body h4')).toBeVisible();
        await expect(area.locator('select[data-answer]')).toBeVisible();
        await expect(area.locator('select[data-answer]')).toHaveValue('Unknown');
        await expect(area.getByLabel('Accountable owner', { exact: true })).toBeVisible();
        await expect(area.getByLabel('Remaining uncertainty', { exact: true })).toBeVisible();
        await expect(area.getByLabel('Next action', { exact: true })).toBeVisible();
      }
      const fields = worksheet.locator('input[data-answer], textarea[data-answer]');
      expect(await fields.count()).toBeGreaterThan(0);
      for (const field of await fields.all()) {
        await expect(field).toBeVisible();
        await expect(field).toHaveValue('');
      }
    }
    await expect(page.locator('.optional-support')).toBeHidden();
  } finally {
    await context.close();
  }
});

test('enhanced printing reveals collapsed areas and preserves complete temporary answers', async ({
  page,
}) => {
  await page.goto('/learn/readiness/');
  const worksheet = page.locator('[data-worksheet]');
  await expect(worksheet).toHaveClass(/worksheet-enhanced/);
  const firstArea = worksheet.locator('#proposition');
  const decision = 'Can the clinic test a combined account view?';
  const owner = 'Clinic product team';
  const evidence = Array.from(
    { length: 8 },
    (_, index) =>
      `Evidence ${index + 1}: Synthetic clinic fixture, version 4fe782c7, reviewed for this fictional exercise. Customer benefit and live partner availability remain unverified; record the next customer interview before deciding.`
  ).join('\n');
  await worksheet.getByLabel('Decision or proposition', { exact: true }).fill(decision);
  await worksheet.getByLabel('Discussion owner', { exact: true }).fill(owner);
  await firstArea.locator('select[data-answer]').selectOption('Investigating');
  const evidenceLabel = firstArea.locator('label').filter({ hasText: 'Evidence held' });
  await evidenceLabel.locator('textarea').fill(evidence);
  const expandAll = worksheet.locator('[data-expand-worksheet]');
  await expandAll.click();
  await expect(expandAll).toHaveText('Collapse all');
  await expandAll.click();
  await expect(worksheet.locator('.is-collapsed')).toHaveCount(areaIds.length);
  await expect(firstArea.locator('.area-body')).toBeHidden();
  await expect(page.locator('.optional-support')).toBeVisible();

  await page.emulateMedia({ media: 'print' });
  for (const id of areaIds) {
    const area = worksheet.locator(`#${id}`);
    await expect(area.locator('h3')).toBeVisible();
    await expect(area.locator('.area-body h4')).toBeVisible();
  }
  await expect(worksheet.locator('input[data-answer]').first()).toBeHidden();
  await expect(worksheet.locator('textarea[data-answer]').first()).toBeHidden();
  await expect(firstArea.locator('select[data-answer]')).toBeHidden();
  const decisionOutput = worksheet
    .locator('label')
    .filter({ hasText: 'Decision or proposition' })
    .locator('.print-answer');
  await expect(decisionOutput).toBeVisible();
  await expect(decisionOutput).toHaveText(decision);
  await expect(
    worksheet.locator('label').filter({ hasText: 'Discussion owner' }).locator('.print-answer')
  ).toHaveText(owner);
  await expect(
    firstArea.locator('label').filter({ hasText: 'Current state' }).locator('.print-answer')
  ).toHaveText('Investigating');
  const evidenceOutput = evidenceLabel.locator('.print-answer');
  await expect(evidenceOutput).toBeVisible();
  expect(await evidenceOutput.textContent()).toBe(evidence);
  const dimensions = await evidenceOutput.evaluate((element) => ({
    content: element.scrollHeight,
    visible: element.clientHeight,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.visible + 1);
  await expect(page.locator('.optional-support')).toBeHidden();
  await expect(page.locator('[data-print-worksheet]').first()).toBeHidden();
});

for (const width of [390, 1440]) {
  test(`search discovers the readiness worksheet and SME example at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const resource of [
      { query: 'readiness', path: '/learn/readiness' },
      { query: 'One business. More than one bank.', path: '/commons/sme-multi-bank-cash-flow' },
    ]) {
      await page.goto('/');
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await dialog.locator('.search-input').fill(resource.query);
      const result = dialog.locator(`a[href="${resource.path}"]`);
      await expect(result).toBeVisible();
      await result.click();
      await expect(page).toHaveURL(new RegExp(`${resource.path}/?$`));
      await expect(page.locator('main h1')).toBeVisible();
    }
  });
}
