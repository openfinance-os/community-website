import { roleLabels } from './taxonomy';

export const glossaryData = [
  {
    letter: 'A',
    terms: [
      {
        term: 'AIS',
        full: 'Account Information Service',
        definition:
          'A service that provides consolidated information on payment accounts held by a user at other payment service providers.',
      },
      {
        term: 'ASPSP',
        full: 'Account Servicing Payment Service Provider',
        definition:
          'A term used in open banking for a provider that holds payment accounts. UAE integration guidance uses LFI; TPP access is mediated by the central API Hub.',
      },
      {
        term: 'Al Tareq',
        full: null,
        definition:
          'The UAE Open Finance brand. Nebras operates the central infrastructure under CBUAE oversight.',
      },
      {
        term: 'API',
        full: 'Application Programming Interface',
        definition:
          'A set of protocols and tools that allow different software applications to communicate with each other.',
      },
      {
        term: 'API Hub',
        full: null,
        definition:
          'The central mediator between TPPs and LFIs in UAE Open Finance. It exposes TPP-facing APIs, acts as the OIDC/FAPI authorization server, issues access tokens and owns consent state.',
      },
    ],
  },
  {
    letter: 'B',
    terms: [
      {
        term: 'BDSP',
        full: roleLabels.BDSP,
        definition:
          'A directory role for bank data sharing. A role claim describes permissions and does not establish an organization’s licence category.',
      },
      {
        term: 'BSIP',
        full: roleLabels.BSIP,
        definition:
          'A directory role for bank service initiation. Consult the operator’s documentation for the permissions attached to this role.',
      },
    ],
  },
  {
    letter: 'C',
    terms: [
      {
        term: 'CIBA',
        full: 'Client Initiated Backchannel Authentication',
        definition:
          'An OpenID authentication flow that separates the client request from the device on which the user authenticates.',
      },
      {
        term: 'CBUAE',
        full: 'Central Bank of the United Arab Emirates',
        definition:
          'The regulatory authority overseeing the UAE Open Finance framework and licensing of financial institutions.',
      },
      {
        term: 'Consent',
        full: null,
        definition:
          'Customer authorization for financial data sharing or payment initiation. In UAE Open Finance, the API Hub creates and manages the consent state; an LFI does not keep an independent consent state.',
      },
      {
        term: 'CoP',
        full: 'Confirmation of Payee',
        definition:
          "A name-checking service that verifies the recipient's name before a payment is made, helping prevent misdirected payments.",
      },
    ],
  },
  {
    letter: 'D',
    terms: [
      {
        term: 'DCR',
        full: 'Dynamic Client Registration',
        definition:
          'Registration of an OAuth client through a protocol endpoint. Directory flags are declarations and do not verify this endpoint’s availability.',
      },
      {
        term: 'Directory',
        full: 'Trust Framework Directory',
        definition:
          'A registry publishing organization registrations, role claims, authorization servers and API resources. Published metadata does not establish live usage or successful integration.',
      },
    ],
  },
  {
    letter: 'F',
    terms: [
      {
        term: 'FAPI',
        full: 'Financial-grade API',
        definition:
          'A security standard specifically designed for high-risk financial APIs, providing enhanced protection against attacks.',
      },
    ],
  },
  {
    letter: 'I',
    terms: [
      {
        term: 'ISP',
        full: roleLabels.ISP,
        definition: 'A directory role for insurance service provision.',
      },
    ],
  },
  {
    letter: 'L',
    terms: [
      {
        term: 'LFI',
        full: roleLabels.LFI,
        definition:
          'A regulated financial institution, such as a bank or insurer, that provides data or services through the API Hub using its Ozone Connect backend interface.',
      },
    ],
  },
  {
    letter: 'M',
    terms: [
      {
        term: 'mTLS',
        full: 'Mutual Transport Layer Security',
        definition:
          'A security protocol where both client and server authenticate each other using digital certificates.',
      },
    ],
  },
  {
    letter: 'N',
    terms: [
      {
        term: 'Nebras',
        full: null,
        definition:
          'The operator of the Al Tareq platform, responsible for the technical and operational aspects of UAE Open Finance infrastructure.',
      },
    ],
  },
  {
    letter: 'O',
    terms: [
      {
        term: 'OAuth',
        full: 'Open Authorization',
        definition:
          'An open standard for access delegation, commonly used to grant websites or applications access to information without sharing passwords.',
      },
      {
        term: 'Open Banking',
        full: null,
        definition:
          'A system where banks and other financial institutions share customer data with third parties via APIs, with customer consent.',
      },
      {
        term: 'Open Finance',
        full: null,
        definition:
          'An extension of Open Banking that includes sharing of data beyond payment accounts, such as insurance, investments, and pensions.',
      },
      {
        term: 'Ozone Connect',
        full: null,
        definition:
          'The LFI backend interface called by the API Hub to retrieve data and execute services. TPPs use the Hub-facing APIs instead of calling this interface directly.',
      },
    ],
  },
  {
    letter: 'P',
    terms: [
      {
        term: 'PIS',
        full: 'Payment Initiation Service',
        definition:
          "A service that initiates a payment from a customer's bank account at their request.",
      },
      {
        term: 'PKCE',
        full: 'Proof Key for Code Exchange',
        definition:
          'An extension to OAuth 2.0 that prevents authorization code interception attacks.',
      },
      {
        term: 'PSP',
        full: 'Payment Service Provider',
        definition:
          'An organization that provides payment services such as processing transactions or enabling payments.',
      },
    ],
  },
  {
    letter: 'R',
    terms: [
      {
        term: 'Raidiam',
        full: null,
        definition:
          'The technology provider powering the UAE Open Finance trust framework and directory services.',
      },
    ],
  },
  {
    letter: 'S',
    terms: [
      {
        term: 'Sandbox',
        full: null,
        definition:
          'A testing environment that allows TPPs to develop and test their applications without affecting real customer data.',
      },
      {
        term: 'SCA',
        full: 'Strong Customer Authentication',
        definition:
          'Multi-factor authentication required for accessing payment accounts or initiating transactions.',
      },
    ],
  },
  {
    letter: 'T',
    terms: [
      {
        term: 'TPP',
        full: 'Third Party Provider',
        definition:
          'A provider consuming Open Finance services through the API Hub. Customer data sharing and payment initiation require consent. An LFI can also act as a TPP where its licence and permissions allow.',
      },
      {
        term: 'Trust Framework',
        full: null,
        definition:
          'The legal, regulatory, and technical rules governing how participants interact within the Open Finance ecosystem.',
      },
    ],
  },
];

export function glossaryAnchor(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
