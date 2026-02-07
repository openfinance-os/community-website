---
title: "CBUAE API Development Rules for AI Assistants"
type: reference
summary: "Reusable instruction files that teach any AI coding assistant CBUAE API conventions, security patterns, and compliance requirements."
date: 2026-02-07

useCases:
  - compliance
  - payments
  - data
audience:
  - developer
  - tpp
  - bank
maturity: production-ready
license: cc-by-4.0

source:
  platform: github

authoredByContributor: true
contributor: "OpenFinance-OS Community"
contributorUrl: https://github.com/openfinance-os

links:
  github: https://github.com/openfinance-os/ai-rules-cbuae

whyItMatters: "AI coding assistants produce better Open Finance code when they understand CBUAE conventions. These rules encode months of specification reading into files your AI assistant loads automatically."

featured: true

aiTool:
  category: prompt
  platforms:
    - claude-code
    - cursor
    - copilot
    - platform-agnostic
  installCommands:
    - platform: claude-code
      command: "cp -r rules/* .claude/rules/"
      label: "Claude Code"
    - platform: cursor
      command: "cp .cursorrules ."
      label: "Cursor"
    - platform: copilot
      command: "cp .github/copilot-instructions.md .github/"
      label: "GitHub Copilot"
  accelerates:
    - api-integration
    - compliance-checking
    - security-implementation
  snippet: |
    # CBUAE API Conventions
    - Use camelCase for JSON field names per CBUAE spec
    - Always include x-fapi-interaction-id header (UUIDv4)
    - Consent IDs must be UUIDv4
    - All timestamps in ISO 8601 with UTC timezone
    - Payment amounts use ISO 4217 currency codes
---

## What's Included

Platform-specific instruction files that encode CBUAE Open Finance conventions for your AI coding assistant:

| File | Platform | Purpose |
|------|----------|---------|
| `.claude/rules/cbuae-api.md` | Claude Code | Project rules loaded automatically |
| `.cursorrules` | Cursor | Cursor IDE rules file |
| `.github/copilot-instructions.md` | GitHub Copilot | Custom instructions for Copilot |
| `CONVENTIONS.md` | Any | Human-readable reference (also works as AI context) |

## Topics Covered

- **API naming conventions** — camelCase fields, standard header names, pagination patterns
- **FAPI security profile** — mTLS requirements, PKCE, Pushed Authorization Requests
- **Consent lifecycle** — state machine (AwaitingAuthorisation, Authorised, Rejected, Revoked, Expired)
- **Error response format** — standard error codes, error object structure
- **Payment initiation** — idempotency keys, status polling, domestic vs. international transfers
- **Data types** — ISO 4217 currencies, ISO 8601 timestamps, UUIDv4 identifiers

## How To Use

### Claude Code

```bash
# Clone and copy the rules into your project
git clone https://github.com/openfinance-os/ai-rules-cbuae.git
cp -r ai-rules-cbuae/rules/* .claude/rules/
```

Claude will automatically load these rules when working in your project.

### Cursor

```bash
cp ai-rules-cbuae/.cursorrules .
```

### GitHub Copilot

```bash
cp ai-rules-cbuae/.github/copilot-instructions.md .github/
```

### Any AI Assistant

Paste the contents of `CONVENTIONS.md` into your AI assistant's context or system prompt.
