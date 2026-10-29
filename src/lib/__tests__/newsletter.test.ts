/**
 * @vitest-environment happy-dom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BUTTONDOWN_EMBED_ACTION,
  NEWSLETTER_PITCH,
  NEWSLETTER_SIGNUP_EVENT,
  NEWSLETTER_SOURCES,
  bindNewsletterSignupForms,
  focusNewsletterThanks,
  initNewsletterSignup,
  isNewsletterSubscribed,
  markNewsletterSubscribed,
  trackNewsletterSignupSubmit,
} from '../newsletter';

function installPostHog(capture: (...args: unknown[]) => void) {
  window.posthog = {
    capture: (event, properties) => {
      capture(event, properties);
    },
    identify: () => {},
    register: () => {},
  };
}

afterEach(() => {
  document.body.innerHTML = '';
  document.documentElement.className = '';
  delete window.posthog;
});

describe('newsletter signup contract', () => {
  it('posts to the Buttondown embed endpoint for openfinance-os', () => {
    expect(BUTTONDOWN_EMBED_ACTION).toBe(
      'https://buttondown.com/api/emails/embed-subscribe/openfinance-os'
    );
  });

  it('tags subscribers by placement', () => {
    expect(NEWSLETTER_SOURCES).toEqual({
      footer: 'footer',
      news: 'news',
      page: 'newsletter-page',
    });
  });

  it('uses the public briefing pitch', () => {
    expect(NEWSLETTER_PITCH).toBe(
      'Weekly UAE open finance & agentic finance briefing. One email, no spam.'
    );
  });
});

describe('isNewsletterSubscribed', () => {
  it('is true only for subscribed=1', () => {
    expect(isNewsletterSubscribed('?subscribed=1')).toBe(true);
    expect(isNewsletterSubscribed('subscribed=1')).toBe(true);
    expect(isNewsletterSubscribed('?subscribed=1&utm=footer')).toBe(true);
    expect(isNewsletterSubscribed('')).toBe(false);
    expect(isNewsletterSubscribed('?subscribed=0')).toBe(false);
    expect(isNewsletterSubscribed('?subscribed=true')).toBe(false);
  });
});

describe('markNewsletterSubscribed', () => {
  it('adds a class on the document when the thank-you query is present', () => {
    expect(markNewsletterSubscribed('?subscribed=1')).toBe(true);
    expect(document.documentElement.classList.contains('newsletter-subscribed')).toBe(true);
  });

  it('leaves the document alone otherwise', () => {
    expect(markNewsletterSubscribed('?subscribed=0')).toBe(false);
    expect(document.documentElement.classList.contains('newsletter-subscribed')).toBe(false);
  });
});

describe('trackNewsletterSignupSubmit', () => {
  it('captures newsletter_signup_submit when PostHog is present', () => {
    const capture = vi.fn();
    installPostHog(capture);
    window.history.pushState({}, '', '/newsletter/');
    document.title = 'Newsletter | OpenFinance-OS';

    trackNewsletterSignupSubmit('newsletter-page');

    expect(capture).toHaveBeenCalledWith(NEWSLETTER_SIGNUP_EVENT, {
      source: 'newsletter-page',
      page_url: '/newsletter/',
      page_title: 'Newsletter | OpenFinance-OS',
    });
  });

  it('does nothing when PostHog is absent', () => {
    expect(() => trackNewsletterSignupSubmit('footer')).not.toThrow();
  });
});

describe('bindNewsletterSignupForms', () => {
  function mountForm(source: string) {
    const form = document.createElement('form');
    form.setAttribute('data-newsletter-signup', '');
    form.action = BUTTONDOWN_EMBED_ACTION;
    form.method = 'post';
    const tag = document.createElement('input');
    tag.type = 'hidden';
    tag.name = 'tag';
    tag.value = source;
    form.append(tag);
    document.body.append(form);
    return form;
  }

  it('fires the signup event with the tag and still lets the form submit', () => {
    const capture = vi.fn();
    installPostHog(capture);
    const form = mountForm('news');
    bindNewsletterSignupForms(document);

    const event = new Event('submit', { cancelable: true, bubbles: true });
    form.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(capture).toHaveBeenCalledWith(
      NEWSLETTER_SIGNUP_EVENT,
      expect.objectContaining({ source: 'news' })
    );
  });

  it('binds each form once', () => {
    const capture = vi.fn();
    installPostHog(capture);
    const form = mountForm('footer');
    bindNewsletterSignupForms(document);
    bindNewsletterSignupForms(document);

    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    expect(capture).toHaveBeenCalledTimes(1);
  });

  it('skips the event when PostHog is absent', () => {
    const form = mountForm('footer');
    bindNewsletterSignupForms(document);
    expect(() =>
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
    ).not.toThrow();
  });

  it('records an unknown source when the tag field is missing', () => {
    const capture = vi.fn();
    installPostHog(capture);
    const form = document.createElement('form');
    form.setAttribute('data-newsletter-signup', '');
    document.body.append(form);
    bindNewsletterSignupForms(document);

    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    expect(capture).toHaveBeenCalledWith(
      NEWSLETTER_SIGNUP_EVENT,
      expect.objectContaining({ source: undefined })
    );
  });
});

describe('focusNewsletterThanks', () => {
  it('moves focus to the thank-you title after a successful subscribe', () => {
    document.body.innerHTML =
      '<p tabindex="-1" data-newsletter-thanks-title>Thanks for subscribing.</p>';
    const title = document.querySelector<HTMLElement>('[data-newsletter-thanks-title]')!;

    focusNewsletterThanks(document, '?subscribed=1');

    expect(document.activeElement).toBe(title);
  });

  it('does not steal focus on the normal signup view', () => {
    document.body.innerHTML = '<p tabindex="-1" data-newsletter-thanks-title>Thanks</p>';
    const before = document.activeElement;

    focusNewsletterThanks(document, '');

    expect(document.activeElement).toBe(before);
  });

  it('does nothing when the thank-you title is not on the page', () => {
    expect(() => focusNewsletterThanks(document, '?subscribed=1')).not.toThrow();
  });
});

describe('initNewsletterSignup', () => {
  it('marks the page, binds the form, and focuses the thank-you title', () => {
    const capture = vi.fn();
    installPostHog(capture);
    document.body.innerHTML = `
      <form data-newsletter-signup>
        <input type="hidden" name="tag" value="newsletter-page" />
      </form>
      <p tabindex="-1" data-newsletter-thanks-title>Thanks for subscribing.</p>
    `;

    initNewsletterSignup(document, '?subscribed=1');
    document.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(document.documentElement.classList.contains('newsletter-subscribed')).toBe(true);
    expect(document.activeElement).toBe(document.querySelector('[data-newsletter-thanks-title]'));
    expect(capture).toHaveBeenCalledWith(
      NEWSLETTER_SIGNUP_EVENT,
      expect.objectContaining({ source: 'newsletter-page' })
    );
  });
});
