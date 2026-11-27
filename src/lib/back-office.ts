/**
 * Content for /learn/back-office and its homepage teaser.
 *
 * The operating jobs are drawn from the Open Finance Back Office requirements
 * work in the Open Finance OS workshop. Scheme facts cite a published source by
 * key; they were last read in the window named in `SOURCES_CHECKED`.
 */

export const SOURCES_CHECKED = 'between June and September 2026';

export const sources = {
  regulation: {
    label: 'CBUAE Open Finance Regulation',
    href: 'https://rulebook.centralbank.ae/en/rulebook/open-finance-regulation-0',
  },
  liability: {
    label: 'Limitation of Liability Model',
    href: 'https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/124944402/Limitation+of+Liability+Model',
  },
  interaction: {
    label: 'Nebras Interaction Guide',
    href: 'https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/232751177',
  },
  standards: {
    label: 'Al Tareq standards',
    href: 'https://openfinanceuae.atlassian.net/wiki/spaces/OF/overview',
  },
  lfiGuide: {
    label: 'LFI integration guide',
    href: 'https://nebras-open-finance.com/tech/lfi-api-hub',
  },
} as const;

export type SourceKey = keyof typeof sources;

export interface BackOfficeArea {
  id: string;
  title: string;
  /** One line for the homepage teaser. */
  teaser: string;
  question: string;
  anchor: { text: string; source: SourceKey };
  lfi: string[];
  tpp: string[];
}

export const areas: BackOfficeArea[] = [
  {
    id: 'consent',
    title: 'Consent operations',
    teaser: 'Find what a customer agreed to, and act when they withdraw it.',
    question: 'A customer calls about a consent. Can your team see it and act on it?',
    anchor: {
      text: 'Consents are created, stored and managed in the central API Hub. A consent moves through published states such as Awaiting Authorization, Authorized, Suspended, Consumed, Expired and Revoked.',
      source: 'standards',
    },
    lfi: [
      'Give customers a place in your own channels to see and revoke the consents on their accounts.',
      'Give support staff a customer-centred view of consents across every TPP, with each lookup recorded.',
      'Send a revocation through the Hub, then check your own records still agree with it.',
    ],
    tpp: [
      'Show customers what they have agreed to and let them withdraw it in your service.',
      'Stop collecting and using data as soon as a consent is revoked or expires.',
      'Track long-lived consents that are approaching expiry so a service does not fail without warning.',
    ],
  },
  {
    id: 'disputes',
    title: 'Disputes and refunds',
    teaser: 'Investigate an unauthorised payment and answer within the scheme timelines.',
    question: 'A customer says they did not authorise a payment. Who investigates, and with what?',
    anchor: {
      text: 'Customers go to their LFI or TPP first. Participants raise disputes against each other through Nebras within 30 days, the respondent answers within 3 business days, and a formal resolution is due within 15 business days.',
      source: 'interaction',
    },
    lfi: [
      'Reconstruct the payment: the consent at that moment, how the customer authenticated, the payee check and the payment trace.',
      'Decide and pay refunds under dual approval, with the clock recorded as evidence.',
      'Open and track the case with Nebras when another participant is involved.',
    ],
    tpp: [
      'Keep evidence of what you initiated, under which consent, and the risk information you sent with it.',
      'Keep the interaction identifier for every call, because every investigation starts by asking for it.',
      'Answer a dispute raised against you inside the response window, or risk it being decided for the other side.',
    ],
  },
  {
    id: 'reconciliation',
    title: 'Reconciliation and billing',
    teaser: 'Check that what you were billed matches what actually happened.',
    question: 'The invoice arrives. Can you show it matches your own records, line by line?',
    anchor: {
      text: 'API Hub usage is charged per call and invoiced monthly, with invoices distributed on or before the 5th. A billing query has to be raised within 30 days.',
      source: 'interaction',
    },
    lfi: [
      'Match the reports from Nebras against your own platform logs, and explain every difference.',
      'Check the fees due to you from TPPs for payments were calculated and settled correctly.',
      'Work each mismatch to a recorded outcome: corrected internally or raised as a dispute.',
    ],
    tpp: [
      'Match the Nebras invoice against your own call logs before it is paid.',
      'If you serve other businesses through your licence, re-bill them from records you can defend.',
      'Know your cost per customer journey, because every balance check and payment carries a fee.',
    ],
  },
  {
    id: 'reporting',
    title: 'Compliance reporting and records',
    teaser: 'Answer a regulator inquiry with a complete, dated trail.',
    question:
      'The regulator asks what happened to one customer last year. How long does the answer take?',
    anchor: {
      text: 'Participants keep records for at least five years, and personal data is destroyed once its purpose is complete, subject to retention law.',
      source: 'regulation',
    },
    lfi: [
      'Produce a per-customer bundle on request: consent history, payments, payee checks and disputes.',
      'Keep an append-only record of what staff looked at and changed, and who approved it.',
      'Review the performance and error reports the Hub publishes about your service.',
    ],
    tpp: [
      'Show that data was used only for the purpose the customer agreed to, and not passed on.',
      'Prove deletion when a purpose ends, while holding what retention law requires.',
      'Keep the consent and transaction records that carry the burden of proof in a dispute.',
    ],
  },
  {
    id: 'risk',
    title: 'Risk, fraud and liability',
    teaser: 'Spot a problem before it becomes a liability claim.',
    question: 'Would you notice a failure today, or on next month’s invoice?',
    anchor: {
      text: 'The scheme sets per-incident compensation between participants, from AED 350 for a failed consent revocation to AED 10,000 for failing to prevent fraudulent or unauthorised use.',
      source: 'liability',
    },
    lfi: [
      'Watch for unusual TPP behaviour: volume spikes, odd hours, rising payee-check mismatches.',
      'Monitor the events that carry compensation, such as consent-state and revocation failures.',
      'Report an individual fraud incident to Nebras, and suspicious activity through your own AML channel.',
    ],
    tpp: [
      'Send complete risk information with every payment, and run the payee check first.',
      'Watch your own patterns for account takeover and misuse of a consent.',
      'Track late or failed initiations, which can make you the liable party.',
    ],
  },
  {
    id: 'service',
    title: 'Service levels and incidents',
    teaser: 'Stay inside the published service levels, and handle it when you do not.',
    question: 'Your service slows down at month end. Who knows first, you or the ecosystem?',
    anchor: {
      text: 'The published targets include 99.5% availability and a 500 millisecond API response. Planned downtime is registered in advance so that TPPs can be told.',
      source: 'lfiGuide',
    },
    lfi: [
      'Measure your own share of the response time, separate from the Hub’s.',
      'Register planned outages ahead of time and run incidents to a recorded close.',
      'Track certificate expiry, since an expired certificate is an outage.',
    ],
    tpp: [
      'Track success and latency per bank, so you know when one provider is degrading a journey.',
      'Raise incidents with the interaction identifier and timestamps Nebras will ask for.',
      'Tell customers plainly when a bank is unavailable, and recover without duplicate payments.',
    ],
  },
  {
    id: 'change',
    title: 'Certification and change',
    teaser: 'Keep up with standards releases without breaking what is live.',
    question: 'A new standards version lands. What has to be retested, and by when?',
    anchor: {
      text: 'Both roles are certified before go-live, including functional, customer-experience and live-proving steps, and are re-certified when those change. Breaking changes carry a notice period.',
      source: 'standards',
    },
    lfi: [
      'Track each mandatory release against your delivery plan and name the gap early.',
      'Give TPPs notice of a breaking change and run old and new side by side through the transition.',
      'Keep certification evidence current for every licensed entity in the group.',
    ],
    tpp: [
      'Hold a security-profile certification for each application, and renew it when the flow changes.',
      'Test against each bank you depend on, because live behaviour varies by provider and version.',
      'Follow published errata, which can change a field without a new version number.',
    ],
  },
];

/** Controls that sit under every area. */
export const controls = [
  {
    title: 'Two people for consequential actions',
    body: 'Refunds, bulk revocations and regulator reports are requested by one person and approved by another. Nobody approves their own request.',
  },
  {
    title: 'Separate duties',
    body: 'Customer care, finance and risk each see only what their job needs. The separation is enforced in the service, not only hidden in the screen.',
  },
  {
    title: 'A record nobody can edit',
    body: 'Every privileged action is appended to an audit trail that cannot be changed or deleted, with personal data masked.',
  },
  {
    title: 'Numbers you can trace',
    body: 'Every reported figure can be followed back to the records it came from.',
  },
];

/** One event seen from five desks. */
export const thread = [
  { desk: 'Customer care', sees: 'A dispute: the customer did not authorise a payment.' },
  { desk: 'Finance', sees: 'A reconciliation break: a payment that will be reversed.' },
  { desk: 'Risk', sees: 'A signal: possible misuse of a consent.' },
  { desk: 'Operations', sees: 'A case with Nebras and a clock that is running.' },
  { desk: 'Approvals', sees: 'A refund waiting for a second person.' },
];
