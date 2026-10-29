---
title: "TPP Customer Terms & Conditions Template"
type: artifact
summary: "A starting template for TPPs to develop customer-facing terms and conditions for Open Finance data access services in the UAE."
date: 2025-12-30

useCases:
  - compliance
  - onboarding
audience:
  - tpp
  - developer
maturity: concept
license: cc-by-4.0

authoredByContributor: true
contributor: "Open Finance OS Community"
contributorUrl: https://github.com/openfinance-os

links:
  github: https://github.com/openfinance-os/community-website

disclaimers:
  - "EXAMPLE TEMPLATE ONLY - NOT LEGAL ADVICE"
  - "Must be reviewed and customized by qualified legal counsel"
  - "Does not constitute legal advice or regulatory guidance"
  - "Each TPP must ensure compliance with applicable regulations"
featured: false
---

## Purpose

This template provides a starting point for TPPs (Third Party Providers) developing customer terms and conditions for Open Finance services under the UAE's Al Tareq framework.

**This is not a legal document.** It is a structural reference that must be reviewed, adapted, and approved by qualified legal counsel familiar with UAE financial services regulation.

## Template Structure

### Section 1: Introduction and Definitions

```markdown
# [TPP NAME] Open Finance Service Terms

Last Updated: [DATE]

## 1. INTRODUCTION

These Terms and Conditions ("Terms") govern your use of [TPP NAME]'s
Open Finance data access services ("Services") provided through the
UAE Open Finance framework operated by Nebras under the Central Bank
of the UAE's supervision.

## 2. DEFINITIONS

"Account Information" means data about your bank accounts, including
balances, transaction history, and account details.

"ASPSP" means Account Servicing Payment Service Provider, typically
your bank or financial institution.

"Consent" means your explicit authorization for us to access your
Account Information.

"CBUAE" means the Central Bank of the United Arab Emirates.

"Open Finance" means the UAE's framework for secure financial data
sharing as regulated by CBUAE.
```

### Section 2: Service Description

```markdown
## 3. SERVICES WE PROVIDE

3.1 Through our Services, we enable you to:
    (a) View your account information from multiple banks in one place
    (b) [DESCRIBE SPECIFIC SERVICE FEATURES]
    (c) [DESCRIBE VALUE-ADDED SERVICES]

3.2 To provide these Services, we access your Account Information
    through the Open Finance APIs operated by Nebras.
```

### Section 3: Consent and Data Access

```markdown
## 4. YOUR CONSENT

4.1 Before accessing your Account Information, we will request your
    explicit consent. You will be redirected to your bank to
    authorize this access.

4.2 Your consent includes:
    (a) The specific accounts you authorize us to access
    (b) The types of data we can retrieve
    (c) The duration of access (maximum 90 days unless renewed)

4.3 You may withdraw your consent at any time through:
    (a) Our application settings
    (b) Your bank's Open Finance consent management
    (c) Contacting us directly

4.4 Withdrawing consent will stop our access to new data but may
    not delete data already collected during the consent period.
```

### Section 4: Data Handling

```markdown
## 5. HOW WE USE YOUR DATA

5.1 We use your Account Information solely to:
    (a) Provide the Services described in Section 3
    (b) [SPECIFY OTHER PERMITTED USES]

5.2 We will NOT:
    (a) Sell your Account Information to third parties
    (b) Use your data for purposes beyond those consented
    (c) Access your accounts more frequently than necessary

5.3 Data retention: We retain your Account Information for
    [SPECIFY PERIOD] after consent withdrawal, as required for:
    (a) Legal compliance
    (b) Transaction records
    (c) Dispute resolution

## 6. DATA SECURITY

6.1 We implement security measures including:
    (a) Encryption of data in transit and at rest
    (b) Access controls limiting data to authorized personnel
    (c) Regular security assessments
    (d) Compliance with CBUAE security requirements

6.2 In case of a data breach affecting your information, we will:
    (a) Notify you within [TIMEFRAME]
    (b) Report to relevant authorities as required
    (c) Take remedial action
```

### Section 5: Liability and Disclaimers

```markdown
## 7. LIMITATIONS

7.1 Our Services depend on data provided by your bank through Open
    Finance APIs. We are not responsible for:
    (a) Accuracy of data provided by your bank
    (b) Unavailability of banking APIs
    (c) Delays in data updates

7.2 We provide Services "as is" without warranties except as
    required by law.

## 8. OUR LIABILITY

8.1 We are liable for losses caused by our failure to comply with
    these Terms or applicable regulations.

8.2 We are not liable for:
    (a) Indirect or consequential losses
    (b) Losses caused by factors outside our control
    (c) [OTHER EXCLUSIONS AS LEGALLY PERMISSIBLE]

8.3 Our total liability is limited to [SPECIFY AMOUNT/TERMS].
```

### Section 6: Regulatory and Legal

```markdown
## 9. REGULATORY STATUS

9.1 [TPP NAME] is licensed by the Central Bank of the UAE as
    [SPECIFY LICENSE TYPE] under license number [NUMBER].

9.2 We are authorized to provide:
    (a) Account Information Services (AIS)
    (b) [Other authorized services]

9.3 We are supervised by CBUAE and comply with the Open Finance
    Regulation and related regulatory requirements.

## 10. COMPLAINTS

10.1 If you have a complaint about our Services:
     (a) Contact us at [CONTACT DETAILS]
     (b) We will acknowledge within [TIMEFRAME]
     (c) We aim to resolve within [TIMEFRAME]

10.2 If unsatisfied with our response, you may escalate to CBUAE.

## 11. GOVERNING LAW

11.1 These Terms are governed by the laws of the United Arab Emirates.

11.2 Disputes shall be subject to the jurisdiction of UAE courts,
     or [SPECIFY ALTERNATIVE DISPUTE RESOLUTION].
```

### Section 7: Changes and Contact

```markdown
## 12. CHANGES TO THESE TERMS

12.1 We may update these Terms with [NOTICE PERIOD] notice.

12.2 Continued use after changes take effect constitutes acceptance.

12.3 Material changes require your explicit acknowledgment.

## 13. CONTACT US

[TPP NAME]
[Address]
[Email]
[Phone]
[Website]
```

## Customization Checklist

Before using this template, ensure you:

- [ ] Replace all `[PLACEHOLDERS]` with your specific information
- [ ] Have legal counsel review for UAE regulatory compliance
- [ ] Align with your CBUAE license conditions
- [ ] Match your actual data handling practices
- [ ] Include required consumer protection disclosures
- [ ] Translate to Arabic if required for your user base
- [ ] Establish version control and update procedures

## Related Resources

- CBUAE Open Finance Regulation
- UAE Data Protection Law (Federal Decree-Law No. 45/2021)
- Al Tareq Trust Framework requirements
- CBUAE Consumer Protection requirements
