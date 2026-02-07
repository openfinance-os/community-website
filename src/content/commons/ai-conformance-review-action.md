---
title: "AI Conformance Review GitHub Action"
type: artifact
summary: "A GitHub Action that uses AI to review pull requests for CBUAE API conformance — checks headers, consent flows, error handling, and security patterns before merge."
date: 2026-02-03

useCases:
  - compliance
  - payments
audience:
  - developer
  - tpp
  - bank
maturity: demo
license: mit

source:
  platform: github

authoredByContributor: true
contributor: "OpenFinance-OS Community"
contributorUrl: https://github.com/openfinance-os

links:
  github: https://github.com/openfinance-os/ai-conformance-action

aiTool:
  category: workflow
  platforms:
    - platform-agnostic
  accelerates:
    - compliance-checking
    - api-integration
  snippet: |
    # .github/workflows/conformance.yml
    - uses: openfinance-os/ai-conformance-action@v1
      with:
        spec-version: "1.0"
        check-consent-lifecycle: true
        check-fapi-headers: true
        check-error-responses: true
---

## What It Does

On every pull request that touches API-related code, this GitHub Action runs an AI-powered conformance review that checks your implementation against the CBUAE Open Finance specification.

### Checks Performed

| Check | What It Validates |
|-------|-------------------|
| **FAPI Headers** | Presence of `x-fapi-interaction-id`, `x-fapi-auth-date`, `x-fapi-customer-ip-address` |
| **Consent Lifecycle** | Correct state transitions, proper handling of expired/revoked consents |
| **Error Responses** | Standard error object structure, appropriate HTTP status codes |
| **Payment Idempotency** | Idempotency key generation and handling for payment initiation |
| **Data Types** | ISO 4217 currency codes, ISO 8601 timestamps, UUIDv4 identifiers |
| **Security Patterns** | Token validation, scope checking, mTLS certificate handling |

## Setup

Add to your repository's `.github/workflows/` directory:

```yaml
name: CBUAE Conformance Review

on:
  pull_request:
    paths:
      - 'src/api/**'
      - 'src/services/**'

jobs:
  conformance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: openfinance-os/ai-conformance-action@v1
        with:
          spec-version: "1.0"
          check-consent-lifecycle: true
          check-fapi-headers: true
          check-error-responses: true
          check-payment-idempotency: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## How It Works

1. The action identifies changed files related to API implementations
2. It loads the CBUAE specification for the configured version
3. An AI model analyzes the code changes against the spec
4. Results are posted as PR review comments with specific suggestions
5. The action fails if critical conformance issues are found

## Example Output

The action posts inline review comments like:

> **CBUAE Conformance: Missing FAPI Header**
> This endpoint handler doesn't check for the `x-fapi-interaction-id` request header. Per CBUAE spec section 3.1.2, all API responses must echo this header back. Consider adding header extraction and response mirroring.

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `spec-version` | `"1.0"` | CBUAE Open Finance spec version to check against |
| `check-consent-lifecycle` | `true` | Validate consent state transitions |
| `check-fapi-headers` | `true` | Check for required FAPI headers |
| `check-error-responses` | `true` | Validate error response structure |
| `check-payment-idempotency` | `false` | Check idempotency key handling |
| `fail-on-critical` | `true` | Fail the check if critical issues are found |
| `comment-threshold` | `"warning"` | Minimum severity to post as PR comment |
