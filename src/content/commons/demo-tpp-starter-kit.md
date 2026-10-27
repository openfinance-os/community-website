---
title: "Open Finance Hackathon Docs"
type: utility
summary: "Complete documentation hub for the ADCB & Nebras UAE Open Finance Hackathon — from quick start guides and API references to the starter kit and project examples."
date: 2025-12-30

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
  github: https://github.com/openfinance-os/docs
  docs: https://docs.openfinance-hackathon.com

disclaimers:
  - "Hackathon documentation for sandbox environment"
  - "APIs and examples are for hackathon participants"
featured: false
---

## Overview

The [Open Finance Hackathon Documentation](https://docs.openfinance-hackathon.com) is designed to help hackathon teams get up and running fast — from your first API call to your final demo. This community-maintained resource provides everything you need to build innovative financial applications using UAE Open Finance APIs.

## Documentation Structure

The docs are organized into focused sections to help you find what you need:

### Getting Started

Quick orientation for new participants:
- **Starter Kit** — Full-stack application with backend API and frontend UI
- **Postman Collection** — Pre-configured API testing environment
- **Client Registration** — Step-by-step sandbox onboarding

### Open Finance APIs

Complete API reference documentation covering:

| API Category | Description |
|--------------|-------------|
| **Bank Data Sharing** | Consent-driven access to customer banking data including accounts, balances, transactions, and beneficiaries |
| **Payment Initiation** | Consent-driven initiation and management of customer payments |
| **Products and Leads** | Structured banking product data with application capabilities |
| **Confirmation of Payee** | Verification of payee account details before payments |

### Hackathon Challenge Tracks

Four focus areas combining intelligent automation with Open Finance:

- **Retail & Wealth** — Personal finance insights and investment guidance
- **SME & Corporate** — Business cash-flow and lending solutions
- **Risk & Compliance** — Fraud detection and regulatory automation
- **Smart Automation** — Autonomous systems with user consent

## Starter Kit Quick Start

The hackathon starter kit provides an integrated development environment with Node.js/Express backend and Vite-powered frontend.

### Installation

```bash
# Clone the repository
git clone https://github.com/openfinance-os/starter-kit.git
cd starter-kit

# Install dependencies
npm install
```

### Configuration

Add your credentials to `api/config.js`:

```javascript
module.exports = {
  CLIENT_ID: 'your_client_id',
  SIGNING_KEY_ID: 'your_signing_key_id'
};
```

Place your certificate files in `api/certificates/`:
- `client_signing.key`
- `client_transport.key`
- `client_transport.pem`

### Run Development Server

```bash
npm run dev
```

Access points:
- **Swagger API Docs**: `http://localhost:1411/api-docs`
- **Frontend UI**: `http://localhost:1411/client`

## Key Capabilities

The starter kit enables these core workflows:

- **User Registration** — Onboard to the Open Finance sandbox
- **OAuth Consent Flows** — Implement authorization with banks
- **Token Management** — Handle access and refresh tokens
- **Banking Data Access** — Retrieve accounts, balances, transactions
- **Payment Initiation** — Create and manage payments
- **Payee Confirmation** — Verify payment recipients
- **Product Discovery** — Explore available financial products

## Contributing to the Docs

The documentation is open source and welcomes contributions:

```bash
# Clone the docs repository
git clone https://github.com/openfinance-os/docs.git
cd docs

# Install Mintlify CLI
npm i -g mintlify

# Start local development server
mint dev
```

View your changes at `http://localhost:3000`.

## Resources

| Resource | Link |
|----------|------|
| **Live Documentation** | [docs.openfinance-hackathon.com](https://docs.openfinance-hackathon.com) |
| **Docs GitHub Repo** | [github.com/openfinance-os/docs](https://github.com/openfinance-os/docs) |
| **Community Discussions** | [GitHub Discussions](https://github.com/openfinance-os/docs/discussions) |
| **Open Finance Standards** | [OpenFinance UAE Wiki](https://openfinanceuae.atlassian.net/wiki/spaces/tfdocsv7) |

## Agentic Coding

The docs include resources for building AI-powered financial applications, with guidance on implementing agentic workflows that leverage Open Finance APIs.

## Support

For hackathon support:
- Post questions in [GitHub Discussions](https://github.com/openfinance-os/docs/discussions)
- Check the Support section in the documentation
- Review existing examples and project templates

## License

MIT License — see the [docs repository](https://github.com/openfinance-os/docs) for details.
