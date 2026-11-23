---
draft: true
title: "Open Finance Context Pack"
type: reference
summary: "A curated, AI-optimized knowledge base of CBUAE specs, API schemas, and integration patterns — ready to drop into any AI assistant's context window."
date: 2026-01-28

useCases:
  - payments
  - data
  - compliance
  - onboarding
audience:
  - developer
  - tpp
  - bank
  - all
maturity: production-ready
license: cc-by-4.0

source:
  platform: github

authoredByContributor: true
contributor: "Open Finance OS Community"
contributorUrl: https://github.com/openfinance-os

links:
  github: https://github.com/openfinance-os/context-pack

whyItMatters: "AI assistants produce significantly better code when they have precise domain knowledge. This pack distills hundreds of pages of CBUAE documentation into focused, structured files optimized for AI context windows."

aiTool:
  category: knowledge-base
  platforms:
    - platform-agnostic
    - claude-code
    - cursor
    - copilot
  installCommands:
    - platform: claude-code
      command: "cp context-pack/* .claude/rules/"
      label: "Claude Code (as project rules)"
    - platform: cursor
      command: "Add files via Cursor @docs or paste into project context"
      label: "Cursor"
  accelerates:
    - api-integration
    - compliance-checking
    - consent-management
    - security-implementation
    - documentation
  snippet: |
    Condensed references covering:
    - Account Information API schema + examples
    - Payment Initiation API schema + examples
    - Consent lifecycle state machine
    - FAPI security profile requirements
    - Common anti-patterns to avoid
---

## What's Included

Condensed, AI-friendly reference files covering every major aspect of the UAE Open Finance standard:

### API Schemas
- **Account Information API** — full request/response schemas with field descriptions and example payloads
- **Payment Initiation API** — domestic and international payment flows with status transitions
- **Confirmation of Funds** — balance check request/response patterns

### Consent Management
- State machine diagram (AwaitingAuthorisation → Authorised → Revoked/Expired)
- Scope definitions and permission model
- Token binding requirements
- Consent expiry and refresh patterns

### Security
- FAPI 1.0 Advanced profile requirements
- mTLS certificate setup and validation
- Pushed Authorization Requests (PAR)
- PKCE implementation
- Token endpoint authentication methods

### Integration Patterns
- Happy path flows with sequence diagrams
- Error handling and retry strategies
- Pagination for large datasets
- Webhook/event notification patterns
- Common anti-patterns and how to avoid them

### Glossary
- UAE-specific financial terms (e.g., Shariah-compliant products)
- CBUAE regulatory terminology
- Technical abbreviations (ASPSP, TPP, AISP, PISP)

## Why a Context Pack?

AI coding assistants work best when they have structured, relevant domain knowledge. Without it, they fall back on generic patterns that may not match CBUAE requirements.

This pack bridges the gap: instead of pasting spec PDFs into chat windows, you get pre-formatted reference files that your AI assistant can consume efficiently.

## Usage

### Claude Code
```bash
git clone https://github.com/openfinance-os/context-pack.git
cp context-pack/references/* .claude/rules/
```

### Cursor
Add the reference files to Cursor's `@docs` feature, or include them in your project root for automatic context.

### Any AI Assistant
Copy the relevant sections from the `references/` directory and paste into your AI assistant's context or system prompt.
