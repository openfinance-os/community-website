---
title: "The UX of Consent Models in Open Banking"
type: reference
summary: "A comprehensive analysis of consent user experience patterns from the UK Open Banking Implementation Entity, with lessons applicable to UAE's Al Tareq ecosystem."
date: 2025-12-30

whyItMatters: "Customer consent is the foundation of Open Finance trust. This article from Scott Logic provides battle-tested UX patterns from the UK's mature Open Banking ecosystem. Understanding these patterns helps UAE TPPs and banks design consent flows that are both compliant and user-friendly, reducing drop-off rates while maintaining regulatory alignment."

useCases:
  - onboarding
  - data
  - compliance
audience:
  - tpp
  - bank
  - developer
maturity: production-ready

source:
  platform: blog
  url: https://blog.scottlogic.com/2018/08/24/the-ux-of-consent-models-in-open-banking.html

authoredByContributor: false
contributor: "OpenFinance-OS Community"
contributorUrl: https://github.com/openfinance-os

links:
  article: https://blog.scottlogic.com/2018/08/24/the-ux-of-consent-models-in-open-banking.html

disclaimers:
  - "External content - not authored by OpenFinance-OS"
  - "UK-specific patterns may require adaptation for UAE context"
featured: false
---

## Key Takeaways for UAE Implementation

The article outlines the OBIE (Open Banking Implementation Entity) three-stage consent model, which provides a useful framework for Al Tareq implementations:

### The Three Stages

1. **Consent Stage** - The TPP explains what data is needed and why
2. **Authentication Stage** - The bank verifies customer identity
3. **Authorisation Stage** - The customer approves specific data sharing

### Relevance to UAE

While the UK model differs from UAE's centralized Nebras infrastructure, the UX principles remain applicable:

- **Clear data scope communication** - Customers must understand exactly what they're sharing
- **Familiar authentication patterns** - Banks should use consistent login experiences
- **Explicit authorization confirmation** - The final step reinforces customer control

### Design Principles Worth Adopting

The article emphasizes several principles that align with CBUAE's customer protection focus:

- Make consent **time-bound** to reinforce customer control
- Create **visual distinction** between TPP and bank flows
- Use **positive friction** at key decision points
- Provide **clear revocation paths**

## How This Applies to Al Tareq

When building on the Al Tareq platform, consider:

1. **Pre-consent education** - Help users understand Open Finance before the flow begins
2. **Consent duration visibility** - Make the 90-day consent window clear
3. **Account selection UX** - Allow granular control when multiple accounts exist
4. **Post-consent confirmation** - Summarize what was shared and for how long

## Further Reading

This reference pairs well with:
- CBUAE Open Finance customer consent guidelines
- Al Tareq consent API specifications
- FDX (Financial Data Exchange) consent receipt standards
