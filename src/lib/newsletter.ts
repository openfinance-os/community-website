export const BUTTONDOWN_EMBED_ACTION =
  'https://buttondown.com/api/emails/embed-subscribe/openfinance-os';

export const NEWSLETTER_SIGNUP_EVENT = 'newsletter_signup_submit';

export const SLACK_JOIN_URL =
  'https://join.slack.com/t/openfinance-os/shared_invite/zt-4f6yrsi0w-qPd32ve~7Czekf0BWJRgLQ';

export const SLACK_JOIN_EVENT = 'slack_join_click';

export const SLACK_JOIN_PLACEMENTS = {
  newsletter: 'newsletter',
  thanks: 'newsletter-thanks',
  footer: 'footer',
} as const;

export type SlackJoinPlacement = (typeof SLACK_JOIN_PLACEMENTS)[keyof typeof SLACK_JOIN_PLACEMENTS];

export const NEWSLETTER_PITCH =
  'Weekly UAE open finance & agentic finance briefing. One email, no spam.';

/** Hidden `tag` values sent with the Buttondown embed form. */
export const NEWSLETTER_SOURCES = {
  footer: 'footer',
  news: 'news',
  page: 'newsletter-page',
} as const;

export type NewsletterSource = (typeof NEWSLETTER_SOURCES)[keyof typeof NEWSLETTER_SOURCES];

export function isNewsletterSubscribed(search: string): boolean {
  const query = search.startsWith('?') ? search.slice(1) : search;
  return new URLSearchParams(query).get('subscribed') === '1';
}

/** Adds `newsletter-subscribed` so the page can swap the form for a thank-you. */
export function markNewsletterSubscribed(
  search: string,
  root: HTMLElement = document.documentElement
): boolean {
  const subscribed = isNewsletterSubscribed(search);
  if (subscribed) root.classList.add('newsletter-subscribed');
  return subscribed;
}

/**
 * Fires `newsletter_signup_submit` when PostHog is loaded.
 * The embed form itself still submits without JavaScript.
 */
export function trackNewsletterSignupSubmit(source?: string): void {
  if (typeof window === 'undefined' || !window.posthog) return;
  window.posthog.capture(NEWSLETTER_SIGNUP_EVENT, {
    source,
    page_url: window.location.pathname,
    page_title: document.title,
  });
}

export function bindNewsletterSignupForms(root: ParentNode): void {
  root.querySelectorAll<HTMLFormElement>('form[data-newsletter-signup]').forEach((form) => {
    if (form.dataset.newsletterBound === 'true') return;
    form.dataset.newsletterBound = 'true';
    form.addEventListener('submit', () => {
      const tag = form.querySelector<HTMLInputElement>('input[name="tag"]');
      trackNewsletterSignupSubmit(tag?.value);
    });
  });
}

export function focusNewsletterThanks(root: ParentNode, search: string): void {
  if (!isNewsletterSubscribed(search)) return;
  root.querySelector<HTMLElement>('[data-newsletter-thanks-title]')?.focus();
}

/** Fires `slack_join_click` when PostHog is loaded. The link still works without it. */
export function trackSlackJoinClick(placement?: string): void {
  if (typeof window === 'undefined' || !window.posthog) return;
  window.posthog.capture(SLACK_JOIN_EVENT, {
    placement,
    page_url: window.location.pathname,
    page_title: document.title,
  });
}

export function bindSlackJoinLinks(root: ParentNode): void {
  root.querySelectorAll<HTMLAnchorElement>('a[data-slack-join]').forEach((link) => {
    if (link.dataset.slackBound === 'true') return;
    link.dataset.slackBound = 'true';
    link.addEventListener('click', () => {
      trackSlackJoinClick(link.dataset.slackJoin);
    });
  });
}

export function initNewsletterSignup(root: ParentNode, search: string): void {
  markNewsletterSubscribed(search);
  bindNewsletterSignupForms(root);
  bindSlackJoinLinks(root);
  focusNewsletterThanks(root, search);
}
