import { expect, test } from '@playwright/test';

const subject = 'UAE Open Finance: why 12 of 30 registrations publish an auth server';
const slug = 'uae-open-finance-why-12-of-30-registrations';
const issuePath = `/newsletter/archive/${slug}`;
const image = '/newsletter/header.webp';
const slackUrl =
  'https://join.slack.com/t/openfinance-os/shared_invite/zt-4f6yrsi0w-qPd32ve~7Czekf0BWJRgLQ';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const calls: unknown[][] = [];
    (window as unknown as { __newsletterCaptures: unknown[][] }).__newsletterCaptures = calls;
    window.posthog = {
      capture: (...args: unknown[]) => {
        calls.push(args);
      },
      identify: () => {},
      register: () => {},
    };
  });
});

test('archive lists sent issues newest first', async ({ page }) => {
  await page.goto('/newsletter/archive/');

  await expect(page).toHaveTitle('Newsletter archive | Open Finance OS');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Past issues of the weekly UAE Open Finance briefing.'
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://openfinance-os.org/newsletter/archive/'
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://openfinance-os.org/newsletter/og/archive.png'
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
  await expect(page.getByRole('heading', { level: 1, name: 'Newsletter archive' })).toBeVisible();

  const card = page.locator('.news-card');
  await expect(card).toHaveCount(1);
  await expect(card.locator('time')).toHaveText('Oct 29, 2026');
  await expect(card.getByRole('heading', { name: subject })).toBeVisible();
  await expect(card).toHaveAttribute('href', issuePath);
  await expect(card).toContainText('Hello, and welcome to the first issue');
  await expect(card.locator('img')).toHaveAttribute('src', image);
  await expect(card.locator('img')).toHaveAttribute('srcset', /3000w/);
  await expect(page.locator('footer a[href="/newsletter/archive"]')).toBeVisible();
  expect(await page.content()).not.toContain('assets.buttondown.email');
});

test('issue page renders the briefing on the site with subscribe and Slack calls to action', async ({
  page,
}) => {
  await page.goto(`${issuePath}/`);

  await expect(page).toHaveTitle(`${subject} | Open Finance OS`);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /welcome to the first issue/i
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    `${subject} | Open Finance OS`
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    'content',
    /welcome to the first issue/i
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    `https://openfinance-os.org${issuePath}/`
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    `https://openfinance-os.org/newsletter/og/${slug}.png`
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /UAE Open Finance/
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `https://openfinance-os.org${issuePath}/`
  );
  await expect(page.locator('link[rel="canonical"]')).not.toHaveAttribute(
    'href',
    /buttondown\.com/
  );

  await expect(page.getByRole('heading', { level: 1, name: subject })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'This week in UAE Open Finance' })).toBeVisible();
  await expect(page.locator('.issue-body')).not.toContainText('buttondown-editor-mode');
  await expect(page.locator('.issue-body script')).toHaveCount(0);
  expect(await page.content()).not.toContain('assets.buttondown.email');
  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const breadcrumb = schemas.find((schema) => schema.includes('BreadcrumbList'));
  expect(breadcrumb).toContain(subject);
  expect(breadcrumb).not.toContain('Uae Open Finance Why');
  const chart = page.locator('.issue-body img').first();
  await expect(chart).toHaveAttribute('src', image);
  await expect(chart).toHaveAttribute('srcset', /3000w/);
  const fits = await chart.evaluate((element) => {
    const body = element.closest('.issue-body');
    if (!body) return false;
    const style = getComputedStyle(element);
    return (
      element.getBoundingClientRect().width <= body.getBoundingClientRect().width + 1 &&
      style.maxWidth !== 'none'
    );
  });
  expect(fits).toBe(true);

  const form = page.locator('main form[data-newsletter-signup]');
  await expect(form).toHaveAttribute(
    'action',
    'https://buttondown.com/api/emails/embed-subscribe/openfinance-os'
  );
  await expect(form.locator('input[name="tag"]')).toHaveValue('newsletter_archive');

  const join = page.locator('a[data-slack-join="newsletter_archive"]');
  await expect(join).toHaveAttribute('href', slackUrl);
  await expect(join).toHaveAttribute('target', '_blank');
  await join.evaluate((element) => {
    element.addEventListener('click', (event) => event.preventDefault(), true);
  });
  await join.click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as { __newsletterCaptures: unknown[][] }).__newsletterCaptures.filter(
          (call) => call[0] === 'slack_join_click'
        )
      )
    )
    .toEqual([['slack_join_click', expect.objectContaining({ placement: 'newsletter_archive' })]]);
});

test('sitemap includes the archive index and sent issues', async ({ request }) => {
  const index = await request.get('/sitemap-index.xml');
  expect(index.ok()).toBeTruthy();
  const indexBody = await index.text();
  const child = indexBody.match(/\/sitemap-[^<"]+\.xml/)?.[0];
  expect(child).toBeTruthy();
  const sitemap = await request.get(child!);
  expect(sitemap.ok()).toBeTruthy();
  const body = await sitemap.text();
  expect(body).toContain('https://openfinance-os.org/newsletter/archive/');
  expect(body).toContain(`https://openfinance-os.org${issuePath}/`);
});
