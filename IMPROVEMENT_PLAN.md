# Website Improvement Plan

Based on a comprehensive review of the OpenFinance-OS community website, here are recommended improvements organized by priority and category.

---

## High Priority (Recommended)

### 1. Accessibility Fixes

| Issue | Current State | Improvement |
|-------|--------------|-------------|
| **Chart Accessibility** | DonutChart and HistoricalTrendsChart SVGs lack descriptive labels | Add detailed `aria-label` attributes describing chart data and meaning |
| **Filter Tab Pattern** | News/Events filters use `role="tab"` but incomplete ARIA implementation | Implement full ARIA tablist/tabpanel pattern with `aria-controls`, `aria-labelledby` |
| **Dark Mode Contrast** | Primary link color (#0d4f4f) may have insufficient contrast on dark backgrounds | Adjust link colors for WCAG AAA compliance in dark mode |
| **Mobile Nav Focus** | No keyboard trap management for mobile navigation | Add focus trap for accessible mobile nav |

### 2. SEO Improvements

| Issue | Current State | Improvement |
|-------|--------------|-------------|
| **Structured Data** | No JSON-LD markup | Add schema.org markup for Organization, NewsArticle, Event types |
| **Open Graph Images** | Missing og:image meta tags | Add custom preview images for social sharing |
| **RSS Feed** | No RSS feed for news | Generate RSS feed from news collection for external aggregators |

### 3. Code Quality

| Issue | Current State | Improvement |
|-------|--------------|-------------|
| **City Fallback Duplication** | City resolution logic duplicated in `index.astro` and `observatory/index.astro` | Extract to a shared utility function in `/src/lib/` |
| **Inline Types** | Types like `DataPoint` defined inline in components | Consolidate in `/src/lib/types.ts` |
| **Data Format Compatibility** | Complex dual-env format handling scattered | Create clean data access layer |

---

## Medium Priority (Nice to Have)

### 4. User Experience

| Issue | Current State | Improvement |
|-------|--------------|-------------|
| **Search Functionality** | No search for Observatory or Learn sections | Add client-side search using Pagefind or Lunr.js |
| **Data Staleness Indicator** | No indication if data is outdated | Display alert when Observatory data is >24h old |
| **Enhanced Chart Tooltips** | Charts are static | Add interactive tooltips showing exact values on hover |

### 5. Performance

| Issue | Current State | Improvement |
|-------|--------------|-------------|
| **Font Loading** | Fonts loaded from Google Fonts CDN | Self-host fonts for faster loading and privacy |
| **Chart SVG Optimization** | Large SVGs with many elements | Optimize SVG paths, reduce complexity |
| **Image Optimization** | Some brand assets may not be optimized | Ensure all images are properly compressed |

### 6. Infrastructure

| Issue | Current State | Improvement |
|-------|--------------|-------------|
| **Data Collector Modularity** | Large 700+ line script | Split into smaller modules (transform, merge, trends) |
| **Health Monitoring** | No data freshness checks | Add GitHub workflow to alert on stale data (>48h) |
| **Error Recovery UI** | Empty state when API fails | Display user-friendly message about data unavailability |

---

## Low Priority (Future Enhancements)

### 7. Future Features

| Feature | Description |
|---------|-------------|
| **Multi-language Support** | Add Arabic language support with hreflang tags |
| **Event Tracking** | Add Plausible event tracking for key interactions |
| **Email Newsletter** | Add newsletter signup for community updates |
| **Contributor Dashboard** | Track community contributions |

---

## Implementation Effort Estimates

| Category | Items | Complexity |
|----------|-------|------------|
| Accessibility Fixes | 4 items | Low-Medium |
| SEO Improvements | 3 items | Low |
| Code Quality | 3 items | Medium |
| User Experience | 3 items | Medium-High |
| Performance | 3 items | Low-Medium |
| Infrastructure | 3 items | Medium |

---

## Recommended Implementation Order

1. **Phase 1 - Quick Wins** (Accessibility + SEO basics)
   - Add aria-labels to charts
   - Fix dark mode link contrast
   - Add structured data (JSON-LD)
   - Add og:image meta tags

2. **Phase 2 - Code Quality**
   - Extract utility functions
   - Consolidate types
   - Clean up data access patterns

3. **Phase 3 - Enhanced UX**
   - Add RSS feed
   - Implement search
   - Add data staleness indicator

4. **Phase 4 - Performance & Infrastructure**
   - Self-host fonts
   - Add health monitoring
   - Improve error states

---

## Questions for Review

Before proceeding, please consider:

1. **Scope**: Which priorities should I focus on (High/Medium/Low)?
2. **Accessibility**: Is WCAG AAA compliance required, or is AA sufficient?
3. **Search**: Would you prefer Pagefind (static, easy setup) or a different solution?
4. **RSS**: Should the RSS feed include full article content or just summaries?
5. **Structured Data**: Any specific schema types beyond Organization, NewsArticle, Event?

---

*Please review and let me know which improvements you'd like me to implement.*
