/** On-brand replacements for Buttondown-hosted issue images. Applied on import and again when rendering. */
export const NEWSLETTER_IMAGE_MAP = [
  {
    buttondown: 'https://assets.buttondown.email/images/d8343b7a-3a46-49e8-a3aa-164e05ff9efb.png',
    src: '/newsletter/header.webp',
    width: 3000,
    height: 1000,
    sizes: '(min-width: 1040px) 900px, calc(100vw - 3rem)',
    alt: 'Open Finance OS weekly briefing, issue 1, 29 October 2026.',
  },
  {
    buttondown: 'https://assets.buttondown.email/images/69f9d977-f05e-4ffc-8eef-9eb939404193.png',
    src: '/newsletter/topics.webp',
    width: 3000,
    height: 1300,
    sizes: '(min-width: 760px) 640px, calc(100vw - 3rem)',
    alt: "Bar chart of this issue's seven stories: three on the UAE ecosystem, two on agentic payments, one on Pay by Bank in Europe, and one on commercial models.",
  },
  {
    buttondown: 'https://assets.buttondown.email/images/696a561d-ad0b-49d3-92fc-b1b9ab99ed95.png',
    src: '/newsletter/story-registry-light.webp',
    width: 3600,
    height: 1500,
    sizes: '(min-width: 760px) 640px, calc(100vw - 3rem)',
    alt: 'UAE registry: 12 of 30 production registrations publish an authorization server. Production directory snapshot, 28 October 2026.',
  },
  {
    buttondown: 'https://assets.buttondown.email/images/81fb0abe-95a4-4b58-a1af-ccfb6cf86def.png',
    src: '/newsletter/story-calls-light.webp',
    width: 3600,
    height: 1500,
    sizes: '(min-width: 760px) 640px, calc(100vw - 3rem)',
    alt: 'Weekly digest: 1.42 million cumulative API calls from November 2025 to September 2026. Al Tareq platform logs via Ecosystem Watch, observed 26 October 2026.',
  },
  {
    buttondown: 'https://assets.buttondown.email/images/2660481b-c36b-4dc6-a5c7-c9c064cb21d0.png',
    src: '/newsletter/story-nbf-light.webp',
    width: 3600,
    height: 1500,
    sizes: '(min-width: 760px) 640px, calc(100vw - 3rem)',
    alt: 'UAE banks: NBF Direct adds Open Finance with multi-bank access. Issue #1, 29 October 2026.',
  },
  {
    buttondown: 'https://assets.buttondown.email/images/f3faf407-d4a4-4627-bf3e-964074386596.png',
    src: '/newsletter/story-commercial-light.webp',
    width: 3600,
    height: 1500,
    sizes: '(min-width: 760px) 640px, calc(100vw - 3rem)',
    alt: 'Sibos 2026: commercial models to scale account-to-account payments and AI services. Issue #1, 29 October 2026.',
  },
  {
    buttondown: 'https://assets.buttondown.email/images/af89ae15-def1-49ef-9ddc-84c20c7d7b57.png',
    src: '/newsletter/story-europe-light.webp',
    width: 3600,
    height: 1500,
    sizes: '(min-width: 760px) 640px, calc(100vw - 3rem)',
    alt: 'Europe: Pay by Bank via Mastercard Open Finance in nine markets. Issue #1, 29 October 2026.',
  },
  {
    buttondown: 'https://assets.buttondown.email/images/eafd69a9-83b8-4c21-a185-35cba8175d17.png',
    src: '/newsletter/agent-access.webp',
    width: 3000,
    height: 2250,
    sizes: '(min-width: 760px) 640px, calc(100vw - 3rem)',
    alt: 'Diagram of how an AI agent reaches a UAE bank: the customer gives consent, a licensed TPP acts within it, the Nebras API Hub stores authorization, and the bank returns data or executes the payment. Al Tareq is the customer-facing brand and Aani is the instant payment rail. Simplified community illustration, not an official diagram.',
  },
];

const byUrl = new Map();
for (const image of NEWSLETTER_IMAGE_MAP) {
  byUrl.set(image.buttondown, image);
  byUrl.set(image.src, image);
}

export const ISSUE_OG_WIDTH = 1200;
export const ISSUE_OG_HEIGHT = 630;

/** 1200×630 social cards for the newsletter landing page and the archive index. */
export const NEWSLETTER_OG_PATH = '/newsletter/og/newsletter.png';
export const ARCHIVE_OG_PATH = '/newsletter/og/archive.png';

export function issueOgPath(slug) {
  return `/newsletter/og/${slug}.png`;
}

export function lookupNewsletterImage(url) {
  if (!url) return undefined;
  return byUrl.get(url.trim());
}

export function normalizeOpenFinanceCasing(value) {
  return value.replace(/\bUAE\s+open\s+finance\b/gi, 'UAE Open Finance');
}

export function rewriteNewsletterImages(value) {
  if (!value) return value;
  let next = value;
  for (const image of NEWSLETTER_IMAGE_MAP) {
    next = next.split(image.buttondown).join(image.src);
  }
  return next;
}

export function prepareIssueContent(issue) {
  return {
    subject: normalizeOpenFinanceCasing(issue.subject ?? ''),
    description: normalizeOpenFinanceCasing(issue.description ?? ''),
    body: normalizeOpenFinanceCasing(rewriteNewsletterImages(issue.body ?? '')),
    image: rewriteNewsletterImages(issue.image ?? '') || null,
  };
}
