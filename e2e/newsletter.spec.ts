import { expect, test } from '@playwright/test';

const pitch = 'Weekly UAE open finance & agentic finance briefing. One email, no spam.';
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

  await expect(page).toHaveTitle('Newsletter | OpenFinance-OS');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', pitch);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    'Newsletter | OpenFinance-OS'
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', pitch);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    'https://openfinance-os.org/newsletter/'
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /\/og-image\.png$/
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://openfinance-os.org/newsletter/'
  );
  await expect(page.getByRole('heading', { level: 1, name: 'Newsletter' })).toBeVisible();
  await expect(page.locator('main')).toContainText(pitch);

  const form = page.locator('main form[data-newsletter-signup]');
  await expect(form).toHaveAttribute('action', action);
  await expect(form).toHaveAttribute('method', 'post');
  await expect(form.locator('input[name="email"]')).toHaveAttribute('type', 'email');
  await expect(form.locator('input[name="tag"]')).toHaveValue('newsletter-page');
  await expect(page.getByRole('main').getByLabel('Email address')).toBeVisible();
  await expect(page.locator('main .newsletter-thanks')).toBeHidden();

  const email = page.getByRole('main').getByLabel('Email address');
  await email.focus();
  await expect(email).toBeFocused();

  await page.goto('/newsletter/?subscribed=1');
  await expect(page.locator('main .newsletter-thanks')).toBeVisible();
  await expect(page.locator('main .newsletter-thanks')).toContainText('Thanks for subscribing.');
  await expect(page.locator('main form[data-newsletter-signup]')).toBeHidden();
  await expect(page.locator('main')).toContainText(pitch);
  await expect(page.locator('[data-newsletter-thanks-title]')).toBeFocused();
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

test('submitting a signup fires newsletter_signup_submit when PostHog is present', async ({
  page,
}) => {
  await page.goto('/newsletter/');
  const form = page.locator('main form[data-newsletter-signup]');
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
