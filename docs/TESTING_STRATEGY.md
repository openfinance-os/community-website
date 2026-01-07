# Testing Strategy for OpenFinance-OS Community Website

This document outlines the testing strategy to ensure the community website works correctly across all components.

## Overview

The testing strategy is organized into three layers:

| Layer | Framework | Purpose | Scope |
|-------|-----------|---------|-------|
| **Unit Tests** | Vitest | Test isolated functions | Utility functions, scoring algorithms, data transformations |
| **Integration Tests** | Vitest + Mocks | Test connected systems | API clients, content validation |
| **E2E Tests** | Playwright | Test user flows | Critical pages, navigation, RSS feed |

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage of utility functions
- **Integration Tests**: All external API integrations covered with mocks
- **E2E Tests**: All critical user paths verified

---

## 1. Unit Testing with Vitest

### Why Vitest?

- Native Astro support
- Fast execution (Vite-powered)
- TypeScript-first
- Compatible with Jest APIs for familiar syntax
- Built-in coverage reporting

### Files to Test

#### High Priority (Pure Functions)

| File | Functions | Test File |
|------|-----------|-----------|
| `src/lib/city-utils.ts` | `findProfile`, `getDisplayCity`, `calculateCityDistribution` | `src/lib/__tests__/city-utils.test.ts` |
| `scripts/utils/article-summarizer.ts` | `generateSlug`, `generateArticleId`, `inferArticleType`, `inferArticleRegion`, `extractSummary` | `scripts/utils/__tests__/article-summarizer.test.ts` |
| `scripts/utils/news-api-client.ts` | `scoreArticle`, `rankArticles` | `scripts/utils/__tests__/news-api-client.test.ts` |

#### Medium Priority (With Mocking)

| File | Functions | Notes |
|------|-----------|-------|
| `scripts/utils/rss-feed-client.ts` | `fetchRssFeeds` | Mock fetch |
| `scripts/utils/directory-client.ts` | API calls | Mock fetch |

### Sample Test Structure

```typescript
// src/lib/__tests__/city-utils.test.ts
import { describe, it, expect } from 'vitest';
import { findProfile, getDisplayCity, calculateCityDistribution } from '../city-utils';

describe('city-utils', () => {
  describe('findProfile', () => {
    it('finds profile by exact name match', () => { /* ... */ });
    it('finds profile by shortName', () => { /* ... */ });
    it('returns undefined when no match found', () => { /* ... */ });
  });

  describe('getDisplayCity', () => {
    it('returns city when not Unknown', () => { /* ... */ });
    it('falls back to profile headquarters when city is Unknown', () => { /* ... */ });
  });
});
```

---

## 2. Integration Testing

### API Client Tests

Test external integrations with mocked responses:

```typescript
// scripts/utils/__tests__/news-api-client.test.ts
import { describe, it, expect, vi } from 'vitest';
import { fetchNewsArticles } from '../news-api-client';

describe('NewsAPI Client', () => {
  it('fetches and deduplicates articles', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'ok', articles: [...] })
    }));

    const articles = await fetchNewsArticles({ apiKey: 'test', config: mockConfig });
    expect(articles).toHaveLength(expectedLength);
  });
});
```

### Content Schema Tests

Validate content collection schemas work correctly:

```typescript
// src/content/__tests__/config.test.ts
describe('Content Schemas', () => {
  it('validates news entries correctly', () => { /* ... */ });
  it('rejects invalid news types', () => { /* ... */ });
});
```

---

## 3. E2E Testing with Playwright

### Why Playwright?

- Cross-browser testing (Chrome, Firefox, Safari)
- Visual regression testing
- Network request mocking
- Already aligned with Lighthouse CI in the pipeline

### Critical User Flows to Test

| Flow | Description | Priority |
|------|-------------|----------|
| Homepage Load | Verify homepage renders with key elements | High |
| Observatory Dashboard | Check data visualization renders | High |
| News Page | Verify news articles load and filter | Medium |
| RSS Feed | Validate RSS XML structure | High |
| Navigation | Test header navigation links | Medium |
| Search | Test search dialog functionality | Medium |

### Sample E2E Test

```typescript
// e2e/homepage.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display hero section with CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Open Finance');
    await expect(page.locator('[data-testid="cta-button"]')).toBeVisible();
  });

  test('should show ecosystem stats', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="stat-participants"]')).toBeVisible();
  });
});
```

---

## 4. CI/CD Integration

### Updated Pipeline

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-node
      - run: npm run test
      - run: npm run test:coverage

  e2e:
    name: E2E Tests
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-node
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

### NPM Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 5. Test Data & Fixtures

### Directory Structure

```
├── src/lib/__tests__/
│   ├── city-utils.test.ts
│   └── fixtures/
│       └── profiles.json
├── scripts/utils/__tests__/
│   ├── article-summarizer.test.ts
│   ├── news-api-client.test.ts
│   └── fixtures/
│       ├── articles.json
│       └── config.json
├── e2e/
│   ├── homepage.spec.ts
│   ├── observatory.spec.ts
│   ├── news.spec.ts
│   └── rss.spec.ts
└── vitest.config.ts
```

---

## 6. Implementation Phases

### Phase 1: Foundation (Current)
- [x] Document testing strategy
- [ ] Install Vitest and Playwright
- [ ] Configure test runners
- [ ] Create first unit tests for `city-utils.ts`

### Phase 2: Unit Test Coverage
- [ ] Unit tests for `article-summarizer.ts`
- [ ] Unit tests for `news-api-client.ts` scoring
- [ ] Content schema validation tests

### Phase 3: E2E Tests
- [ ] Homepage E2E test
- [ ] Observatory E2E test
- [ ] RSS feed E2E test
- [ ] Navigation E2E tests

### Phase 4: CI Integration
- [ ] Add test job to CI pipeline
- [ ] Add coverage reporting
- [ ] Add E2E tests to pipeline

---

## 7. Running Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode during development
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test file
npm run test -- city-utils
```

---

## 8. Best Practices

1. **Test Naming**: Use descriptive names that explain what is being tested
   - Good: `'returns Dubai when profile headquarters is Dubai'`
   - Bad: `'test1'`

2. **Arrange-Act-Assert**: Structure tests clearly
   ```typescript
   it('calculates city distribution correctly', () => {
     // Arrange
     const participants = [/* ... */];
     const profiles = {/* ... */};

     // Act
     const result = calculateCityDistribution(participants, profiles);

     // Assert
     expect(result).toEqual({ Dubai: 2, 'Abu Dhabi': 1 });
   });
   ```

3. **Test Edge Cases**: Include tests for:
   - Empty inputs
   - Missing/undefined values
   - Boundary conditions
   - Error scenarios

4. **Keep Tests Fast**: Unit tests should complete in milliseconds

5. **Mock External Dependencies**: Never make real API calls in tests

---

## 9. Coverage Thresholds

Configure minimum coverage in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70
      }
    }
  }
});
```
