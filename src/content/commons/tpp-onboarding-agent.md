---
title: "TPP Onboarding Agent"
type: utility
summary: "An AI agent that guides developers through the complete TPP registration and first-API-call journey — from directory enrollment to a working sandbox integration."
date: 2026-01-20

useCases:
  - onboarding
  - compliance
  - identity
audience:
  - developer
  - tpp
maturity: concept
license: apache-2.0

source:
  platform: github

authoredByContributor: true
contributor: "OpenFinance-OS Community"
contributorUrl: https://github.com/openfinance-os

links:
  github: https://github.com/openfinance-os/tpp-onboarding-agent

aiTool:
  category: agent
  platforms:
    - claude-code
    - platform-agnostic
  installCommands:
    - platform: claude-code
      command: "claude plugin install openfinance-os/tpp-onboarding-agent"
      label: "Claude Code Plugin"
  accelerates:
    - participant-onboarding
    - security-implementation
    - sandbox-testing
  snippet: |
    This agent walks you through:
    1. Registering with the Trust Framework Directory
    2. Generating transport and signing certificates
    3. Configuring Dynamic Client Registration
    4. Making your first consent request
    5. Completing a payment initiation flow
    6. Validating your sandbox integration
---

## What It Does

Getting started as a TPP (Third-Party Provider) in the UAE Open Finance ecosystem involves multiple steps across different systems — the Trust Framework Directory, certificate authorities, ASPSP sandbox APIs, and your own application code.

This agent breaks the process into manageable, sequential steps. At each step, it:
- Explains what you're doing and why
- Generates the required configuration files or code
- Validates that the step completed successfully
- Provides troubleshooting guidance if something goes wrong

## The Onboarding Journey

### Step 1: Directory Registration
The agent helps you register as a participant in the Trust Framework Directory, filling in required organization details and selecting appropriate roles (AISP, PISP, or both).

### Step 2: Certificate Generation
Generates certificate signing requests (CSRs) for both transport and signing certificates. Walks you through submitting them to the appropriate certificate authority.

### Step 3: Dynamic Client Registration
Using your certificates, the agent generates a DCR request payload and helps you register your application with each target ASPSP's authorization server.

### Step 4: First Consent Request
Creates a consent request flow, including the redirect URI setup, scope selection, and customer authorization simulation in the sandbox.

### Step 5: First API Call
With a valid access token, the agent generates code to make your first account information or payment initiation API call, handling all the required headers and authentication.

### Step 6: Validation
Runs a suite of checks to verify your integration is working correctly — token refresh, consent revocation, error handling, and pagination.

## Usage

### Claude Code

```bash
claude plugin install openfinance-os/tpp-onboarding-agent
```

Then start the agent:

```
/tpp-onboarding-agent:start
```

### Other Platforms

The agent logic is published as a standalone script that works with any AI assistant that supports tool use:

```bash
git clone https://github.com/openfinance-os/tpp-onboarding-agent.git
cd tpp-onboarding-agent
npm install
npm run start
```

## Prerequisites

- Node.js 18 or later
- OpenSSL (for certificate generation)
- A registered organization in the UAE (or sandbox test credentials)
- Basic familiarity with REST APIs and OAuth 2.0
