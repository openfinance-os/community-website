---
title: "Demo TPP Starter Kit"
type: utility
summary: "A forkable Next.js application demonstrating the complete TPP integration flow with Al Tareq sandbox, including authentication, consent, and account data retrieval."
date: 2024-12-01

useCases:
  - onboarding
  - data
  - payments
audience:
  - developer
  - tpp
maturity: demo
license: mit

source:
  platform: github

authoredByContributor: true
contributor: "OpenFinance-OS Community"
contributorUrl: https://github.com/openfinance-os

links:
  github: https://github.com/openfinance-os/demo-tpp-starter
  docs: https://openfinanceuae.atlassian.net/wiki/spaces/tfdocsv7

disclaimers:
  - "Demo application for sandbox environment only"
  - "Not production-ready without security hardening"
  - "Requires valid Al Tareq sandbox credentials"
featured: true
---

## Overview

This starter kit provides a working reference implementation for TPPs building on the UAE Open Finance (Al Tareq) platform. It demonstrates the complete integration flow from customer consent to data retrieval.

## Features

- **FAPI 1.0 Advanced Compliance** - Implements the required security profile
- **Consent Flow UI** - Complete redirect-based authorization
- **Account Information Retrieval** - Fetches balances and transactions
- **Token Management** - Handles access and refresh tokens
- **Error Handling** - Graceful handling of API errors

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Auth**: OpenID Connect / OAuth 2.0
- **Styling**: Tailwind CSS
- **HTTP Client**: Native fetch with type safety

## Quick Start

### Prerequisites

1. **Al Tareq Sandbox Access**
   - Register at [Al Tareq Portal](https://altareq.openfinance.ae)
   - Create a sandbox application
   - Obtain client credentials

2. **Development Environment**
   - Node.js 18+
   - npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/openfinance-os/demo-tpp-starter.git
cd demo-tpp-starter

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Configuration

Edit `.env.local` with your sandbox credentials:

```env
# Al Tareq Sandbox Configuration
ALTAREQ_CLIENT_ID=your_client_id
ALTAREQ_CLIENT_SECRET=your_client_secret
ALTAREQ_REDIRECT_URI=http://localhost:3000/callback

# Sandbox endpoints
ALTAREQ_AUTH_URL=https://sandbox-auth.altareq.openfinance.ae
ALTAREQ_API_URL=https://sandbox-api.altareq.openfinance.ae

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DEMO TPP APPLICATION                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│   │   Frontend   │───▶│   API Routes │───▶│  Al Tareq    │  │
│   │   (Next.js)  │    │   (Next.js)  │    │  Sandbox     │  │
│   └──────────────┘    └──────────────┘    └──────────────┘  │
│          │                   │                   │          │
│          ▼                   ▼                   ▼          │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│   │   Consent    │    │    Token     │    │   Account    │  │
│   │   Management │    │   Storage    │    │   Data API   │  │
│   └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Key Flows

### 1. Consent Initiation

```typescript
// app/api/consent/route.ts
export async function POST(request: Request) {
  const { bankId, accountTypes } = await request.json();

  // Create consent request
  const consentResponse = await fetch(
    `${ALTAREQ_API_URL}/consents`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientAccessToken}`,
      },
      body: JSON.stringify({
        permissions: accountTypes,
        expirationDateTime: getExpirationDate(90), // 90 days
      }),
    }
  );

  const consent = await consentResponse.json();

  // Build authorization URL
  const authUrl = buildAuthUrl({
    consentId: consent.consentId,
    bankId,
    redirectUri: REDIRECT_URI,
  });

  return Response.json({ authUrl, consentId: consent.consentId });
}
```

### 2. Authorization Callback

```typescript
// app/callback/page.tsx
export default async function CallbackPage({ searchParams }) {
  const { code, state } = searchParams;

  // Exchange code for tokens
  const tokens = await exchangeCodeForTokens(code);

  // Store tokens securely
  await storeTokens(tokens);

  // Redirect to dashboard
  redirect('/dashboard');
}
```

### 3. Account Data Retrieval

```typescript
// app/api/accounts/route.ts
export async function GET(request: Request) {
  const accessToken = await getStoredAccessToken();

  const accountsResponse = await fetch(
    `${ALTAREQ_API_URL}/accounts`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-fapi-financial-id': FINANCIAL_ID,
      },
    }
  );

  const accounts = await accountsResponse.json();
  return Response.json(accounts);
}
```

## Project Structure

```
demo-tpp-starter/
├── app/
│   ├── api/
│   │   ├── consent/route.ts      # Consent management
│   │   ├── callback/route.ts     # OAuth callback
│   │   ├── accounts/route.ts     # Account data
│   │   └── transactions/route.ts # Transaction data
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard
│   ├── consent/
│   │   └── page.tsx              # Consent initiation UI
│   └── layout.tsx
├── lib/
│   ├── altareq/
│   │   ├── client.ts             # API client
│   │   ├── auth.ts               # OAuth utilities
│   │   └── types.ts              # Type definitions
│   └── utils/
├── components/
│   ├── AccountCard.tsx
│   ├── ConsentFlow.tsx
│   └── TransactionList.tsx
└── .env.example
```

## Security Considerations

This demo is for **sandbox testing only**. For production:

- [ ] Implement proper session management
- [ ] Add CSRF protection
- [ ] Secure token storage (not localStorage)
- [ ] Add rate limiting
- [ ] Implement audit logging
- [ ] Complete security review
- [ ] Obtain security certifications as required

## Extending the Demo

### Adding Payment Initiation

The demo focuses on Account Information Services (AIS). To add Payment Initiation Services (PIS):

1. Register for PIS scope in Al Tareq
2. Implement payment consent flow
3. Add payment submission endpoints
4. Handle payment status callbacks

### Supporting Multiple Banks

The demo works with a single bank. To support multiple:

1. Implement bank selection UI
2. Store per-bank consent references
3. Aggregate data across consents
4. Handle different bank-specific behaviors

## Troubleshooting

### Common Issues

**"Invalid client credentials"**
- Verify `.env.local` contains correct sandbox credentials
- Check client ID/secret for typos

**"Consent expired"**
- Sandbox consents may expire quickly
- Re-initiate consent flow

**"CORS errors"**
- API calls must go through Next.js API routes
- Don't call Al Tareq directly from browser

## Contributing

Contributions welcome! See the [contribution guide](/commons/contribute) for details.

## License

MIT License - see LICENSE file for details.
