/**
 * Copy for the V2.2 deadline explainer.
 * Dates are taken from Roadmap v3.0 (published 25 March 2026) and nowhere else.
 * https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/6259008/Roadmap
 */
export const V22_DEADLINE = {
  path: '/learn/uae-open-finance-v2-2-deadline/',
  ogPath: '/learn/uae-open-finance-v2-2-deadline/og.png',
  title: 'UAE Open Finance V2.2: the 31 Dec 2026 Tier-1 deadline explained',
  description:
    'What the 31 Dec 2026 Tier-1 deadline and the 31 Mar 2027 public go-live mean for banks, insurers, TPPs and merchants in UAE Open Finance.',
  searchDescription:
    'Tier-1 production release, public go-live after buddy testing, and a V2.2 publication date that is still TBC.',
  sourceUrl: 'https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/6259008/Roadmap',
  sourceLabel: 'Roadmap v3.0, published 25 March 2026',
  kicker: 'Learn / UAE Open Finance',
  lead: 'A bank, an insurer, a licensed app and a merchant are all waiting on one release. The roadmap already names when Tier-1 institutions must ship it, and when customers can use it. The standards themselves are still to be published.',
  story: [
    'Picture a shop that wants a customer to pay from a bank account, or to see an insurance quote, without starting from a blank form. The bank or insurer has to open that service. The TPP, the licensed app in the middle, has to be ready when the service opens. UAE Open Finance is how that handoff is supposed to work.',
    'The next version of the standards is V2.2, and the matching API Hub release is V9. The roadmap describes the banking work as "Uplift to V2.2 Final of the Standards (To be Published Shortly)." Insurers are on an uplift to V2.2 Final of the Standards too, written there as standards alignment for open insurance. The publication date for V2.2 and for API Hub V9 is TBC.',
    'A TBC publication date means the contract is still ahead of the teams who have to build it. The deadline is already written down. The text of the standards is not.',
  ],
  datesIntro:
    'For Tier-1 banks and insurers, the roadmap then separates a production release from a public launch.',
  dates: [
    {
      kicker: 'Tier-1 production release',
      figure: '31 December 2026',
      detail:
        'The CBUAE-regulated LFI release deadline. Tier-1 banks and insurers must release the standards into production. The roadmap names LFIs as the accountable party, and it also asks TPPs to finish the development that follows publication and to release that work into production.',
    },
    {
      kicker: 'Tier-1 public go-live',
      figure: '31 March 2027',
      detail:
        'The LFI and TPP public go-live, after buddy testing. Between the production release and this date, banks, insurers and TPPs test the live service together. This is the day the functionality is meant to be available to customers.',
    },
  ],
  afterDates:
    'For Tier-1 insurers the uplift is set for individual customers. For Tier-1 banks it covers individual, SME and corporate customers. Tier-2 firms are on the same V2.2 uplift, with later deadlines. Those dates stay in the roadmap. They are not listed here, so a Tier-2 plan is not quietly copied from the Tier-1 calendar.',
  partiesHeading: 'What the dates mean in practice',
  parties: [
    {
      title: 'Banks and insurers',
      body: 'The build window opens when V2.2 is published, and the Tier-1 production release is 31 December 2026. Releasing into production is the institution shipping the standards on the live platform. Opening the service to customers comes later, once buddy testing is done.',
    },
    {
      title: 'TPPs',
      body: 'The roadmap names LFIs as the accountable party for the production deadline. It still gives TPPs a job: finish the development that follows publication, release that work into production with the institutions, and complete buddy testing before the public go-live on 31 March 2027.',
    },
    {
      title: 'Merchants',
      body: 'The roadmap assigns these deadlines to LFIs and TPPs. A merchant payment or quote on V2.2 waits on those parties finishing buddy testing. For Tier-1 coverage, the public date to plan around is 31 March 2027. A Tier-2 firm is on a later deadline.',
    },
  ],
  faqHeading: 'Questions people ask',
  faqs: [
    {
      question: 'When is V2.2 published?',
      answer:
        'The publication date is TBC. Roadmap v3.0 marks both V2.2 and API Hub V9 as to be confirmed, and it describes the banking uplift as "Uplift to V2.2 Final of the Standards (To be Published Shortly)."',
    },
    {
      question: 'What happens on 31 December 2026?',
      answer:
        'For Tier-1 banks and insurers, that is the CBUAE-regulated LFI release deadline. Those institutions must have released the standards into production. Customers are meant to meet the service at the later public go-live.',
    },
    {
      question: 'When can customers use it?',
      answer:
        'Public go-live for Tier-1 banks, insurers and TPPs is 31 March 2027, after buddy testing in production. That is the date the roadmap sets for releasing the functionality to customers.',
    },
    {
      question: 'Do Tier-2 firms use the same dates?',
      answer:
        'Tier-2 firms have later deadlines for this uplift. Read those dates in the roadmap rather than borrowing the Tier-1 calendar.',
    },
    {
      question: 'Is this an official CBUAE page?',
      answer:
        'This is a community explainer. The dates and the TBC publication status come from Roadmap v3.0, published 25 March 2026. Check that page before you treat a deadline as final.',
    },
  ],
  sourceHeading: 'Official source',
  sourceIntro:
    'These dates are taken from the public roadmap. This page does not add deadlines of its own.',
  newsletter: {
    heading: 'Hear when the publication date lands',
    body: 'V2.2 is still TBC. The weekly briefing follows UAE Open Finance as the roadmap moves.',
    action: 'Subscribe to the weekly briefing',
    href: '/newsletter',
  },
  callout: {
    kicker: 'A deadline worth reading closely',
    body: 'For Tier-1 banks and insurers, the production release deadline is 31 December 2026. Public go\u2011live, after buddy testing, is 31 March 2027. The V2.2 publication date is still TBC.',
    action: 'Read the explainer',
  },
  ogLines: ['UAE Open Finance V2.2:', 'the 31 Dec 2026 Tier-1', 'deadline explained'],
  ogSubtitle: 'Tier-1 public go-live, after buddy testing, is 31 March 2027.',
} as const;

interface V22SchemaInput {
  pageUrl: string;
  imageUrl: string;
  publisherUrl: string;
  publisherLogo: string;
}

/** Article and FAQPage JSON-LD. Both use the page title. */
export function v22StructuredData(input: V22SchemaInput) {
  const { pageUrl, imageUrl, publisherUrl, publisherLogo } = input;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: V22_DEADLINE.title,
        name: V22_DEADLINE.title,
        description: V22_DEADLINE.description,
        image: [imageUrl],
        inLanguage: 'en',
        isAccessibleForFree: true,
        author: {
          '@type': 'Organization',
          name: 'Open Finance OS',
          url: publisherUrl,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Open Finance OS',
          url: publisherUrl,
          logo: {
            '@type': 'ImageObject',
            url: publisherLogo,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': pageUrl,
          name: V22_DEADLINE.title,
          url: pageUrl,
        },
        url: pageUrl,
      },
      {
        '@type': 'FAQPage',
        name: V22_DEADLINE.title,
        description: V22_DEADLINE.description,
        url: pageUrl,
        mainEntity: V22_DEADLINE.faqs.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };
}
