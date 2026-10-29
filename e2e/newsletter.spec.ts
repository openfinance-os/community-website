import { expect, test } from '@playwright/test';

const pitch = 'The 5-minute weekly on UAE Open Finance, for the people building it';
const action = 'https://buttondown.com/api/emails/embed-subscribe/openfinance-os';

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

test('newsletter page has metadata, the embed form, and a thank-you state', async ({ page }) => {
  await page.goto('/newsletter/');

  await expect(page).toHaveTitle('Newsletter | Open Finance OS');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', pitch);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    'Newsletter | Open Finance OS'
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', pitch);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    'https://openfinance-os.org/newsletter/'
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://openfinance-os.org/newsletter/header.webp'
  );
  await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute(
    'content',
    'image/webp'
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '600');
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '200');
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
    'content',
    /weekly briefing, issue 1/i
  );
  await expect(page.getByRole('heading', { name: 'What you get each week' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Inside an issue' })).toBeVisible();
  await expect(page.getByText('Issue #1 out now')).toBeVisible();
  await expect(page.locator('.hero-art')).toContainText('12 of 30');
  await expect(page.locator('.hero-art')).toContainText('1.42M');
  await expect(page.locator('img[src="/newsletter/story-registry-light.webp"]')).toHaveAttribute(
    'loading',
    'lazy'
  );
  await expect(page.locator('img[src="/newsletter/story-registry.webp"]')).toHaveCount(0);
  await expect(page.locator('img[src="/newsletter/agent-access.webp"]')).toHaveAttribute(
    'loading',
    'lazy'
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://openfinance-os.org/newsletter/'
  );
  await expect(page.getByRole('heading', { level: 1, name: pitch })).toBeVisible();
  await expect(page.getByRole('link', { name: /Read issue #1/ })).toHaveAttribute(
    'href',
    '/newsletter/archive'
  );
  await expect(page.locator('footer a[href="/newsletter/archive"]')).toBeVisible();
  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(schemas.some((schema) => schema.includes('FAQPage'))).toBe(true);
  await expect(page.getByText('How often does it arrive?')).toBeVisible();
  const slackUrl =
    'https://join.slack.com/t/openfinance-os/shared_invite/zt-4f6yrsi0w-qPd32ve~7Czekf0BWJRgLQ';
  const join = page.locator('a[data-slack-join="newsletter"]');
  await expect(join).toHaveAttribute('href', slackUrl);
  await expect(join).toHaveAttribute('target', '_blank');
  await expect(join).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(page.locator('footer a[data-slack-join="footer"]')).toHaveAttribute(
    'href',
    slackUrl
  );
  await join.evaluate((element) => {
    element.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
      },
      true
    );
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
    .toEqual([['slack_join_click', expect.objectContaining({ placement: 'newsletter' })]]);
  await expect(page.locator('main')).toContainText(pitch);

  const form = page.locator('.hero form[data-newsletter-signup]');
  await expect(form).toHaveAttribute('action', action);
  await expect(form).toHaveAttribute('method', 'post');
  await expect(form.locator('input[name="email"]')).toHaveAttribute('type', 'email');
  await expect(form.locator('input[name="tag"]')).toHaveValue('newsletter-page');
  await expect(page.locator('.signup-band form[data-newsletter-signup]')).toHaveAttribute(
    'action',
    action
  );
  await expect(page.locator('.hero').getByLabel('Email address')).toBeVisible();
  await expect(page.locator('main .newsletter-thanks')).toHaveCount(2);

  const email = page.locator('.hero').getByLabel('Email address');
  await email.focus();
  await expect(email).toBeFocused();

  await page.goto('/newsletter/?subscribed=1');
  await expect(page.locator('.hero .newsletter-thanks')).toBeVisible();
  await expect(page.locator('.hero .newsletter-thanks')).toContainText('Thanks for subscribing.');
  await expect(page.locator('.signup-band .newsletter-thanks')).toBeVisible();
  await expect(page.locator('a[data-slack-join="newsletter-thanks"]')).toBeVisible();
  await expect(page.locator('.hero form[data-newsletter-signup]')).toBeHidden();
  await expect(page.locator('.signup-band form[data-newsletter-signup]')).toBeHidden();
  await expect(page.locator('main')).toContainText(pitch);
  await expect(page.locator('[data-newsletter-thanks-title]')).toBeFocused();
});

test('homepage strip and nav expose the newsletter and Slack invite', async ({ page }) => {
  await page.goto('/');
  const slackUrl =
    'https://join.slack.com/t/openfinance-os/shared_invite/zt-4f6yrsi0w-qPd32ve~7Czekf0BWJRgLQ';
  await expect(page.getByRole('heading', { name: 'Stay in the loop' })).toBeVisible();
  await expect(
    page.locator('.stay-loop form[data-newsletter-signup] input[name="tag"]')
  ).toHaveValue('home');
  const homeSlack = page.locator('a[data-slack-join="home"]');
  await expect(homeSlack).toHaveAttribute('href', slackUrl);
  await expect(homeSlack).toHaveText(/Join the Slack/);
  const navSlack = page.locator('a[data-slack-join="nav"]').first();
  await expect(navSlack).toHaveAttribute('href', slackUrl);
  await expect(
    page.locator('nav[aria-label="Main navigation"] a[href="/newsletter"]')
  ).toBeVisible();
});

test('footer and news forms post to Buttondown with a source tag', async ({ page }) => {
  await page.goto('/');
  const footerForm = page.locator('footer.footer form[data-newsletter-signup]');
  await expect(footerForm).toHaveAttribute('action', action);
  await expect(footerForm.locator('input[name="tag"]')).toHaveValue('footer');
  await expect(footerForm.getByLabel('Email address')).toBeVisible();

  await page.goto('/updates/');
  const updatesForm = page.locator('main form[data-newsletter-signup]');
  await expect(updatesForm.locator('input[name="tag"]')).toHaveValue('news');

  await page.goto('/news/');
  const indexForm = page.locator('main form[data-newsletter-signup]');
  await expect(indexForm.locator('input[name="tag"]')).toHaveValue('news');

  await page.goto('/news/2026-01-06-flutterwave-expands-open-banking-with-mono-acquisi/');
  const articleForm = page.locator('main form[data-newsletter-signup]');
  await expect(articleForm.locator('input[name="tag"]')).toHaveValue('news');
  await expect(articleForm.locator('input[name="email"]')).toHaveAttribute('required', '');
});

test('confirmed subscribers land on a noindex welcome page', async ({ page }) => {
  await page.goto('/newsletter/welcome/');

  await expect(page).toHaveTitle('Thanks for subscribing | Open Finance OS');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://openfinance-os.org/newsletter/welcome/'
  );
  await expect(
    page.getByRole('heading', { level: 1, name: 'Thanks for subscribing' })
  ).toBeVisible();
  await expect(page.locator('main')).toContainText('every Monday at noon Dubai time');
  await expect(page.locator('main')).toContainText('29 organisations');
  await expect(page.locator('main')).toContainText('30 registration IDs');
  await expect(page.locator('main')).toContainText('12 publish an auth server');
  await expect(page.locator('main')).toContainText('28 Oct 2026');
  await expect(page.locator('main')).toContainText(
    'Independent, community-run. Not an official CBUAE or Nebras publication.'
  );

  const download = page.locator('a[data-snapshot-download="newsletter_welcome"]');
  await expect(download).toHaveAttribute('href', '/registry-snapshot.pdf');
  await expect(download).toHaveText(/Download/);
  await download.evaluate((element) => {
    element.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
      },
      true
    );
  });
  await download.click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as { __newsletterCaptures: unknown[][] }).__newsletterCaptures.filter(
          (call) => call[0] === 'snapshot_download_click'
        )
      )
    )
    .toEqual([
      ['snapshot_download_click', expect.objectContaining({ placement: 'newsletter_welcome' })],
    ]);

  const slackUrl =
    'https://join.slack.com/t/openfinance-os/shared_invite/zt-4f6yrsi0w-qPd32ve~7Czekf0BWJRgLQ';
  const join = page.locator('a[data-slack-join="newsletter_welcome"]');
  await expect(join).toHaveAttribute('href', slackUrl);
  await expect(join).toHaveAttribute('target', '_blank');
  await expect(join).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(join).toContainText('Join the Slack community');
  await join.evaluate((element) => {
    element.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
      },
      true
    );
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
    .toEqual([['slack_join_click', expect.objectContaining({ placement: 'newsletter_welcome' })]]);

  await expect(
    page.locator('main').getByRole('link', { name: 'Observatory', exact: true })
  ).toHaveAttribute('href', '/observatory');
  const archive = page.locator('main').getByRole('link', { name: /Newsletter archive/ });
  await expect(archive).toHaveAttribute('href', '/newsletter/archive');
  await expect(
    page.locator('nav[aria-label="Main navigation"] a[href="/newsletter"]')
  ).toBeVisible();
  await expect(page.locator('a[href="/newsletter/welcome"]')).toHaveCount(0);
});

test('submitting a signup fires newsletter_signup_submit when PostHog is present', async ({
  page,
}) => {
  await page.goto('/newsletter/');
  const form = page.locator('.hero form[data-newsletter-signup]');
  await form.evaluate((element) => {
    element.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();
      },
      true
    );
  });
  await form.locator('input[name="email"]').fill('reader@example.com');
  await form.locator('button[type="submit"]').click();

  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as { __newsletterCaptures: unknown[][] }).__newsletterCaptures.filter(
          (call) => call[0] === 'newsletter_signup_submit'
        )
      )
    )
    .toEqual([
      [
        'newsletter_signup_submit',
        expect.objectContaining({
          source: 'newsletter-page',
          page_url: '/newsletter/',
        }),
      ],
    ]);
});
