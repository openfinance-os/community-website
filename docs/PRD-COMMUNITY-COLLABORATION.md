# PRD: Community & Collaboration Platform

## OpenFinance-OS Community Hub

---

## 1. Executive Summary

### 1.1 What This Is

The **Community & Collaboration Platform** extends OpenFinance-OS beyond a static information hub into a living ecosystem where participants connect, share knowledge, and build reputation. It comprises three interconnected systems:

1. **Expert Directory** — Opt-in profiles connecting ecosystem participants with relevant expertise
2. **Community Q&A** — Integrated knowledge base bridging AI assistance with human expertise
3. **Contribution Recognition** — Gamification system rewarding community contributions

### 1.2 Why This Matters

UAE Open Finance is nascent. Success depends not just on technical infrastructure but on **human connections**:

- Fintechs need to find implementation consultants
- Banks need to discover potential TPP partners
- Developers need to learn from those who've done integrations
- The community needs incentives to share knowledge

**Official channels handle compliance. We handle community.**

### 1.3 Strategic Value

| Stakeholder | Value |
|-------------|-------|
| **Fintechs** | Find expertise, partners, and proven consultants |
| **Banks** | Discover innovative TPPs for partnerships |
| **Consultants** | Visibility and lead generation |
| **Developers** | Learn from peers, build reputation |
| **OpenFinance-OS** | Network effects, stickiness, differentiation |

### 1.4 Relationship to Habibi Chat Agent

The Community Platform integrates with Habibi:

- Habibi can **search Q&A** before generating answers
- Habibi can **recommend experts** for complex questions
- Habibi can **cite community answers** in responses
- Users can **escalate to community** when Habibi can't help

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Community & Collaboration Platform                   │
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐             │
│  │    Expert      │  │   Community    │  │  Contribution  │             │
│  │   Directory    │  │     Q&A        │  │   Recognition  │             │
│  │                │  │                │  │                │             │
│  │  /community/   │  │  /community/   │  │  /community/   │             │
│  │  experts       │  │  questions     │  │  leaderboard   │             │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘             │
│          │                   │                   │                       │
│          └───────────────────┼───────────────────┘                       │
│                              │                                           │
│                              ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Unified Profile System                        │    │
│  │                                                                   │    │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │    │
│  │   │   GitHub    │  │   Profile   │  │  Activity   │             │    │
│  │   │   Auth      │  │   Data      │  │  History    │             │    │
│  │   └─────────────┘  └─────────────┘  └─────────────┘             │    │
│  │                                                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    GitHub Discussions Backend                    │    │
│  │                 (github.com/openfinance-os/community)            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Expert Directory

### 3.1 Overview

A searchable directory of ecosystem participants who opt-in to share their expertise and make themselves discoverable for collaboration.

### 3.2 Profile Types

| Type | Description | Example Use Case |
|------|-------------|------------------|
| **Consultant** | Independent advisors, implementation specialists | Fintech seeking integration help |
| **Developer** | Engineers with Open Finance experience | Startup building dev team |
| **Bank Representative** | Partnership/developer relations contacts | TPP seeking bank partnership |
| **TPP Representative** | Fintech company representatives | Bank exploring TPP ecosystem |
| **Educator** | Trainers, content creators | Organization seeking training |

### 3.3 Profile Structure

```typescript
interface ExpertProfile {
  // Identity
  id: string;
  displayName: string;
  avatar?: string;
  tagline: string; // "Open Finance Integration Specialist"

  // Classification
  type: ProfileType;
  organization?: string;
  location: string; // "Dubai, UAE"

  // Expertise
  specializations: Specialization[];
  // e.g., ["CIBA Implementation", "Payment APIs", "Consent Management"]

  participantExperience: ParticipantSlug[];
  // Banks/TPPs they've worked with (verified via contributions)

  // Visibility
  visibility: 'public' | 'community-only';
  contactPreference: 'form' | 'email' | 'linkedin';

  // Reputation (calculated)
  reputation: {
    score: number;
    level: ReputationLevel;
    badges: Badge[];
  };

  // Activity
  contributions: ContributionSummary;
  joinedAt: Date;
  lastActiveAt: Date;
}

type Specialization =
  | 'Account Information APIs'
  | 'Payment Initiation APIs'
  | 'CIBA Authentication'
  | 'OAuth/FAPI Security'
  | 'Trust Framework Integration'
  | 'Consent Management'
  | 'Sandbox Testing'
  | 'Production Certification'
  | 'Regulatory Compliance'
  | 'Mobile Integration'
  | 'PFM Applications'
  | 'Lending/Credit'
  | 'Cross-border Payments';
```

### 3.4 Directory UI

**Browse View (`/community/experts`):**
```
┌─────────────────────────────────────────────────────────────────┐
│  Expert Directory                                                │
│  Find specialists in UAE Open Finance                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Filter: [All Types ▼] [All Specializations ▼] [All Locations ▼]│
│  Search: [Search experts...                              ] 🔍   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 👤 Ahmed Al-Rashid                           ⭐ Level 4     ││
│  │    Integration Consultant                                   ││
│  │    📍 Dubai, UAE                                            ││
│  │                                                              ││
│  │    Specializations:                                          ││
│  │    [CIBA] [Payment APIs] [Sandbox Testing]                  ││
│  │                                                              ││
│  │    Experience with: ADIB, Emirates NBD, Mashreq              ││
│  │                                                              ││
│  │    "Helped 5 TPPs achieve production certification"         ││
│  │                                                 [Contact →] ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 👤 Sarah Chen                                ⭐ Level 3     ││
│  │    Senior Developer @ FinTech Co                            ││
│  │    📍 Abu Dhabi, UAE                                        ││
│  │    ...                                                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Load more...]                                                  │
│                                                                  │
│  ────────────────────────────────────────────────────────────── │
│  Want to be listed? [Create your profile →]                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Profile View (`/community/experts/[username]`):**
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Directory                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────┐  Ahmed Al-Rashid                      ⭐⭐⭐⭐         │
│  │      │  Integration Consultant               Level 4          │
│  │ 👤   │  📍 Dubai, UAE                                        │
│  │      │  🏢 Independent                                        │
│  └──────┘                                                        │
│                                                                  │
│  "Helping fintechs navigate UAE Open Finance since 2024"        │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Specializations                                                 │
│  ┌──────────────────┐ ┌──────────────────┐ ┌────────────────┐   │
│  │ CIBA             │ │ Payment APIs     │ │ Certification  │   │
│  │ Implementation   │ │                  │ │                │   │
│  └──────────────────┘ └──────────────────┘ └────────────────┘   │
│                                                                  │
│  Participant Experience                                          │
│  Worked with: [ADIB] [Emirates NBD] [Mashreq] [FAB]             │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Contributions                           Badges                  │
│  • 47 Q&A answers                        🏆 Top Contributor     │
│  • 12 accepted solutions                 📝 Documentation Hero  │
│  • 3 documentation PRs                   🎯 100 Helpful Votes   │
│  • Member since Jan 2025                 🌟 Early Adopter       │
│                                                                  │
│  Recent Activity                                                 │
│  • Answered "How to implement CIBA..." (2 days ago)             │
│  • Answered "Sandbox vs Production..." (1 week ago)             │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  [📧 Contact Ahmed]                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 Contact Flow

**Privacy-First Approach:**
1. No direct contact info displayed (unless user opts in)
2. Contact requests go through OpenFinance-OS form
3. Expert receives notification and can choose to respond
4. Prevents spam while enabling legitimate connections

```
┌─────────────────────────────────────────────────────────────────┐
│  Contact Ahmed Al-Rashid                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Your Name:     [                                           ]    │
│  Your Email:    [                                           ]    │
│  Organization:  [                                           ]    │
│                                                                  │
│  What do you need help with?                                     │
│  ( ) Integration consulting                                      │
│  ( ) Partnership inquiry                                         │
│  ( ) Technical question                                          │
│  ( ) Other                                                       │
│                                                                  │
│  Message:                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │                                                              ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ☐ I agree to the community guidelines                          │
│                                                                  │
│  [Send Request]                                                  │
│                                                                  │
│  ℹ️ Ahmed will receive your message and can choose to respond.  │
│     Your email will only be shared if they reply.               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.6 Verification & Trust

| Trust Signal | How It's Earned |
|--------------|-----------------|
| **Verified Email** | Email confirmation |
| **GitHub Connected** | OAuth authentication |
| **Contributor** | Has merged PRs to OpenFinance-OS |
| **Participant Experience** | Verified through Q&A activity or endorsements |
| **Endorsed** | Other verified experts vouch for them |

---

## 4. Community Q&A

### 4.1 Overview

A knowledge base powered by **GitHub Discussions** with a custom frontend on OpenFinance-OS, integrated with Habibi for AI-assisted answers.

### 4.2 Why GitHub Discussions?

| Benefit | Description |
|---------|-------------|
| **Open** | Anyone can view, GitHub users can participate |
| **Indexed** | Google-searchable answers |
| **Familiar** | Developers already know the interface |
| **Low Maintenance** | No separate forum infrastructure |
| **Integrated** | Links to issues, PRs, and codebase |

### 4.3 Categories

| Category | Label | Description |
|----------|-------|-------------|
| **Getting Started** | `getting-started` | Beginner questions, onboarding |
| **Technical** | `technical` | API integration, authentication, SDKs |
| **Regulatory** | `regulatory` | Compliance, licensing, requirements |
| **Best Practices** | `best-practices` | Architecture, patterns, lessons learned |
| **Announcements** | `announcements` | Official updates, releases |
| **Show & Tell** | `show-and-tell` | Share what you've built |

### 4.4 Integration with Website

**Q&A Page (`/community/questions`):**
```
┌─────────────────────────────────────────────────────────────────┐
│  Community Q&A                                                   │
│  Questions and answers from the UAE Open Finance community      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Ask a Question]                    Sort: [Most Recent ▼]      │
│                                                                  │
│  Filter: [All ▼] [Unanswered ▼]     Search: [          ] 🔍    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ✓ How do I implement CIBA flow with Emirates NBD?              │
│    [technical] [ciba] [enbd]                                    │
│    Asked by @developer123 • 3 days ago • 5 answers              │
│    ✓ Accepted answer by @ahmed-expert                           │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ○ What's the difference between sandbox and production certs?  │
│    [getting-started] [certificates]                             │
│    Asked by @newbie456 • 1 day ago • 2 answers                  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ○ Best practices for consent management UI?                    │
│    [best-practices] [consent] [ux]                              │
│    Asked by @designer789 • 5 hours ago • 0 answers              │
│    💡 Habibi suggested an answer                                │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  [View more on GitHub Discussions →]                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Habibi Integration

**AI-Assisted Answers:**

1. When a new question is posted, Habibi analyzes it
2. If Habibi can provide a helpful answer, it posts as a comment
3. Answer is clearly labeled as AI-generated
4. Community can upvote/downvote AI answers
5. Humans can provide better answers that supersede AI

```
┌─────────────────────────────────────────────────────────────────┐
│  Question: How do I implement CIBA flow with Emirates NBD?       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  @developer123 asked:                                            │
│  I'm trying to implement CIBA authentication flow with ENBD's   │
│  sandbox but getting 401 errors. My client is registered and    │
│  I have valid certificates. What am I missing?                   │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  💬 Answers (3)                                                  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🤖 Habibi (AI Assistant)                      Posted 1h ago ││
│  │                                                              ││
│  │ Based on the Observatory data, Emirates NBD supports CIBA   ││
│  │ in production. For 401 errors in sandbox, common causes:    ││
│  │                                                              ││
│  │ 1. Client ID not registered for CIBA scope                  ││
│  │ 2. Certificate mismatch between registration and request    ││
│  │ 3. Missing `binding_message` parameter                       ││
│  │                                                              ││
│  │ Check your client registration in the Trust Framework       ││
│  │ directory to verify CIBA is enabled.                         ││
│  │                                                              ││
│  │ ⚠️ This is an AI-generated suggestion. Community members    ││
│  │ may provide more specific guidance.                          ││
│  │                                                              ││
│  │ 👍 3  👎 0                                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ✓ @ahmed-expert (Level 4)                 ✓ Accepted Answer ││
│  │                                                              ││
│  │ I've done several ENBD CIBA integrations. The issue is      ││
│  │ likely #2 from Habibi's list. ENBD requires the certificate ││
│  │ CN to exactly match your software statement ID.              ││
│  │                                                              ││
│  │ Here's the fix:                                              ││
│  │ ```                                                          ││
│  │ // Ensure your mTLS certificate CN matches                   ││
│  │ // the software_id in your DCR registration                 ││
│  │ ```                                                          ││
│  │                                                              ││
│  │ Also make sure you're using the correct sandbox endpoint:   ││
│  │ `https://sandbox.api.enbd.ae/...`                            ││
│  │                                                              ││
│  │ 👍 12  👎 0  💬 Reply                                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.6 Moderation

| Role | Permissions |
|------|-------------|
| **Community Member** | Ask, answer, vote |
| **Trusted Member** | Above + flag content |
| **Moderator** | Above + hide, lock, edit |
| **Maintainer** | Above + ban, category management |

**Automated Moderation:**
- Spam detection via GitHub's built-in filters
- Habibi flags potentially incorrect answers for review
- Auto-close stale questions after 90 days of inactivity

---

## 5. Contribution Recognition

### 5.1 Overview

A gamification system that recognizes and rewards community contributions, building engagement and surfacing top contributors.

### 5.2 Point System

| Action | Points | Notes |
|--------|--------|-------|
| **Ask a question** | 2 | Encourages engagement |
| **Answer a question** | 5 | Core contribution |
| **Answer accepted** | 15 | Quality recognition |
| **Upvote received** | 2 | Community validation |
| **Submit news article** | 10 | Content contribution |
| **Article published** | 20 | After maintainer review |
| **Submit documentation PR** | 10 | Technical contribution |
| **PR merged** | 25 | Quality contribution |
| **Report data error** | 10 | Ecosystem improvement |
| **Error confirmed & fixed** | 15 | Valid contribution |
| **Refer new contributor** | 20 | Community growth |

### 5.3 Reputation Levels

| Level | Name | Points Required | Perks |
|-------|------|-----------------|-------|
| 1 | **Newcomer** | 0 | Basic profile |
| 2 | **Contributor** | 50 | Can vote on content |
| 3 | **Regular** | 200 | Featured in directory |
| 4 | **Expert** | 500 | Priority in search results |
| 5 | **Champion** | 1000 | Special badge, moderator nomination eligible |

### 5.4 Badges

**Achievement Badges:**

| Badge | Criteria | Icon |
|-------|----------|------|
| **First Contribution** | First merged PR or accepted answer | 🌱 |
| **Early Adopter** | Joined in first 6 months | 🌟 |
| **Documentation Hero** | 5+ documentation PRs merged | 📝 |
| **Problem Solver** | 10+ accepted answers | 🎯 |
| **Top Contributor** | Top 10 monthly contributors | 🏆 |
| **Streak Master** | 30-day contribution streak | 🔥 |
| **Helpful** | 50+ upvotes received | 💡 |
| **Verified Expert** | Endorsed by 3+ other experts | ✓ |

**Participant Badges (Auto-detected):**

| Badge | Criteria |
|-------|----------|
| **ADIB Expert** | 5+ answers about ADIB |
| **Payment Specialist** | 10+ answers about Payment APIs |
| **CIBA Guru** | 10+ answers about CIBA |

### 5.5 Leaderboard

**Monthly Leaderboard (`/community/leaderboard`):**
```
┌─────────────────────────────────────────────────────────────────┐
│  Community Leaderboard                                           │
│  January 2026                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [This Month] [All Time] [By Category ▼]                        │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  🥇  1. Ahmed Al-Rashid          285 pts   ⭐⭐⭐⭐              │
│      15 answers • 8 accepted • 2 PRs                            │
│      [CIBA Guru] [Payment Specialist]                           │
│                                                                  │
│  🥈  2. Sarah Chen               210 pts   ⭐⭐⭐                │
│      12 answers • 5 accepted • 1 article                        │
│      [Documentation Hero]                                        │
│                                                                  │
│  🥉  3. Mohammed K.              185 pts   ⭐⭐⭐                │
│      10 answers • 6 accepted                                    │
│      [Problem Solver] [ADIB Expert]                             │
│                                                                  │
│  4.  @developer456              145 pts   ⭐⭐                   │
│  5.  @fintech_eng               120 pts   ⭐⭐                   │
│  ...                                                             │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Your Rank: #12 (95 pts this month)                             │
│  [View your contributions →]                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.6 Recognition Moments

**Trigger Points for Celebration:**

| Moment | Display |
|--------|---------|
| First contribution | Welcome modal + badge |
| Level up | Toast notification + confetti |
| Badge earned | Toast notification + profile highlight |
| Top 10 monthly | Email + social shoutout opportunity |
| 100 contributions | Special "Century" badge |

---

## 6. Technical Implementation

### 6.1 Authentication

**GitHub OAuth** for all community features:

```typescript
// Authentication flow
1. User clicks "Join Community" or any action requiring auth
2. Redirect to GitHub OAuth: github.com/login/oauth/authorize
3. User grants access to public profile
4. Callback to openfinance-os.org/auth/callback
5. Create/update local profile linked to GitHub ID
6. Store session in encrypted cookie
```

**Why GitHub:**
- Developers already have accounts
- Reduces friction vs. email/password
- Links to contribution history
- Trust signal (real identity)

### 6.2 Data Storage

| Data | Storage | Rationale |
|------|---------|-----------|
| **Profiles** | Cloudflare KV | Fast reads, simple schema |
| **Q&A Content** | GitHub Discussions | Native integration, free |
| **Points/Badges** | Cloudflare KV | Calculated, cached |
| **Contact Requests** | Cloudflare D1 (SQLite) | Relational, searchable |
| **Activity Log** | Cloudflare Analytics | Aggregate metrics |

### 6.3 API Endpoints

```typescript
// Profile endpoints
GET    /api/community/profile/:username
POST   /api/community/profile          // Create/update own profile
DELETE /api/community/profile          // Delete own profile

// Directory endpoints
GET    /api/community/experts          // List with filters
GET    /api/community/experts/search   // Full-text search

// Contact endpoints
POST   /api/community/contact/:username
GET    /api/community/contact/inbox    // Own received requests

// Reputation endpoints
GET    /api/community/reputation/:username
GET    /api/community/leaderboard
GET    /api/community/badges

// Q&A sync (from GitHub)
POST   /api/webhooks/github/discussions  // Webhook receiver
GET    /api/community/questions          // Cached from GitHub
```

### 6.4 GitHub Integration

**Webhook Events:**
```yaml
# .github/workflows/community-sync.yml
on:
  discussion:
    types: [created, answered, labeled]
  discussion_comment:
    types: [created]
  pull_request:
    types: [closed]  # For contribution tracking
```

**Points Calculation:**
```typescript
// Triggered by GitHub webhook
async function calculateContributionPoints(event: GitHubEvent) {
  switch (event.type) {
    case 'discussion_comment.created':
      await addPoints(event.user, 5);
      break;
    case 'discussion.answered':
      // Answer was marked as accepted
      await addPoints(event.answerer, 15);
      break;
    case 'pull_request.merged':
      if (isPRType(event, 'documentation')) {
        await addPoints(event.user, 25);
      }
      break;
  }

  await checkBadgeEligibility(event.user);
  await updateLeaderboard();
}
```

---

## 7. Privacy & Safety

### 7.1 Data Principles

| Principle | Implementation |
|-----------|----------------|
| **Minimal Collection** | Only collect what's needed for features |
| **User Control** | Users can delete profile anytime |
| **No Selling** | Community data never sold or shared |
| **Transparency** | Clear about what's public vs. private |

### 7.2 Profile Privacy Options

```
Profile Settings:
☑ Show my profile in Expert Directory
☐ Show my email address publicly
☑ Allow contact requests through OpenFinance-OS
☑ Show my contribution history
☐ Show my organization name
```

### 7.3 Anti-Abuse Measures

| Measure | Description |
|---------|-------------|
| **Rate Limiting** | Max 10 contact requests/day |
| **Spam Detection** | Block obvious spam patterns |
| **Report System** | Flag inappropriate content/users |
| **Cooling Off** | 24h wait before re-contacting same person |
| **Block List** | Users can block specific people |

### 7.4 Moderation Guidelines

```markdown
# Community Guidelines

## Be Respectful
- No personal attacks or harassment
- No discrimination of any kind
- Disagree with ideas, not people

## Stay On Topic
- Keep discussions relevant to UAE Open Finance
- No promotional content or spam
- No job postings (use LinkedIn)

## Be Helpful
- Share knowledge generously
- Acknowledge when you're unsure
- Cite sources when possible

## Protect Privacy
- Don't share others' private information
- Don't screenshot private conversations
- Respect "off the record" requests
```

---

## 8. Success Metrics

### 8.1 Engagement

| Metric | 3-month target | 6-month target |
|--------|----------------|----------------|
| Registered profiles | 50 | 200 |
| Expert directory listings | 20 | 75 |
| Monthly active contributors | 30 | 100 |
| Questions asked/month | 20 | 75 |
| Questions answered/month | 40 | 150 |
| Answer acceptance rate | 40% | 60% |

### 8.2 Quality

| Metric | Target |
|--------|--------|
| Time to first answer | <24 hours |
| Expert response rate | >50% contact → reply |
| Community satisfaction | >4.0/5.0 survey |
| Spam rate | <1% of content |

### 8.3 Growth

| Metric | Measurement |
|--------|-------------|
| Referral rate | New users from existing members |
| Retention | Monthly active % of registered |
| Contribution depth | Actions per active user |
| Cross-feature usage | % using 2+ features |

---

## 9. Phased Rollout

### Phase 1: Foundation (Weeks 1-6)

- [ ] GitHub OAuth integration
- [ ] Basic profile system (create, view, edit)
- [ ] Expert directory with search/filter
- [ ] Contact request flow
- [ ] Integration with existing `/community` page

**Deliverables:**
- Working Expert Directory
- Profile management
- Contact system

### Phase 2: Q&A Integration (Weeks 6-12)

- [ ] GitHub Discussions webhook integration
- [ ] Q&A page on OpenFinance-OS website
- [ ] Habibi integration for auto-answers
- [ ] Answer voting and acceptance
- [ ] Category/tag filtering

**Deliverables:**
- Synced Q&A view on website
- AI-assisted answers
- Search integration

### Phase 3: Gamification (Weeks 12-16)

- [ ] Points tracking system
- [ ] Badge definitions and auto-award
- [ ] Reputation levels
- [ ] Leaderboard
- [ ] Profile badges display
- [ ] Level-up notifications

**Deliverables:**
- Full gamification system
- Leaderboard page
- Badge showcase

### Phase 4: Polish & Launch (Weeks 16-20)

- [ ] UI/UX refinement
- [ ] Mobile optimization
- [ ] Performance optimization
- [ ] Community guidelines finalization
- [ ] Moderation tools
- [ ] Launch announcement

**Deliverables:**
- Production-ready community platform
- Moderation dashboard
- Community guidelines

---

## 10. Dependencies & Requirements

### 10.1 External Services

| Service | Purpose | Cost |
|---------|---------|------|
| GitHub OAuth | Authentication | Free |
| GitHub Discussions | Q&A backend | Free |
| Cloudflare KV | Profile storage | Free tier |
| Cloudflare D1 | Contact requests | Free tier |
| SendGrid/Resend | Contact notifications | Free tier |

### 10.2 Internal Requirements

| Requirement | Status |
|-------------|--------|
| Existing `/community` page | Exists |
| GitHub organization | Exists |
| Discussions enabled | Needs setup |
| User authentication | Needs creation |

### 10.3 Team Requirements

| Role | Responsibility |
|------|----------------|
| Developer | OAuth, API, UI |
| Designer | Profile, directory UX |
| Community Manager | Guidelines, moderation |
| Content | Initial Q&A seeding |

---

## 11. Open Questions

1. **Verification levels:** How strictly to verify "participant experience" claims?
2. **Commercial use:** Allow consultants to link to paid services?
3. **Organization profiles:** Support company profiles in addition to individuals?
4. **Endorsements:** Implement peer endorsements for expertise areas?
5. **Rewards:** Consider tangible rewards for top contributors (swag, conference tickets)?
6. **Localization:** Arabic language support priority?

---

## 12. Appendix

### A. Competitive Analysis

| Platform | Strengths | Weaknesses |
|----------|-----------|------------|
| Stack Overflow | SEO, reputation | Generic, not finance-specific |
| LinkedIn Groups | Professional network | Closed, noisy |
| Discord/Slack | Real-time | Not searchable, ephemeral |
| **OpenFinance-OS** | Ecosystem-specific, integrated | New, needs critical mass |

### B. Related PRDs

- [PRD-CHAT-AGENT.md](./PRD-CHAT-AGENT.md) — Habibi AI assistant (integrates with Q&A)
- [PRD.MD](../PRD.MD) — Main OpenFinance-OS website PRD

---

*Built by the community. Open source. For everyone who wants this ecosystem to flourish.*
