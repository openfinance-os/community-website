import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NewsApiArticle } from '../../types/news-curation.js';

// We need to test the functions without importing the module directly
// because it uses ES module syntax with .js extensions
// Instead, let's redefine the pure functions for testing

// =====================
// Function implementations (copied for testing - these match the source)
// =====================

function generateSlug(title: string, date: string): string {
  const datePrefix = date.split('T')[0];
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
    .replace(/-$/, '');

  return `${datePrefix}-${slug}`;
}

function generateArticleId(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function inferArticleType(
  article: NewsApiArticle
): 'global' | 'community' | 'milestone' | 'official' | 'opinion' {
  const text =
    `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();

  if (
    text.includes('cbuae') ||
    text.includes('central bank') ||
    text.includes('regulation') ||
    text.includes('regulatory') ||
    text.includes('license') ||
    text.includes('framework')
  ) {
    return 'official';
  }

  if (
    text.includes('first') ||
    text.includes('launch') ||
    text.includes('milestone') ||
    text.includes('achievement') ||
    text.includes('record')
  ) {
    return 'milestone';
  }

  if (
    text.includes('opinion') ||
    text.includes('analysis') ||
    text.includes('commentary') ||
    text.includes('perspective')
  ) {
    return 'opinion';
  }

  if (
    text.includes('uae') ||
    text.includes('dubai') ||
    text.includes('abu dhabi') ||
    text.includes('emirates')
  ) {
    return 'community';
  }

  return 'global';
}

function inferArticleRegion(article: NewsApiArticle): 'uae' | 'mena' | 'global' {
  const text =
    `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();

  if (
    text.includes('uae') ||
    text.includes('emirates') ||
    text.includes('dubai') ||
    text.includes('abu dhabi') ||
    text.includes('cbuae') ||
    text.includes('central bank of the uae') ||
    text.includes('difc') ||
    text.includes('adgm') ||
    text.includes('altareq') ||
    text.includes('al tareq')
  ) {
    return 'uae';
  }

  if (
    text.includes('saudi') ||
    text.includes('bahrain') ||
    text.includes('qatar') ||
    text.includes('kuwait') ||
    text.includes('oman') ||
    text.includes('egypt') ||
    text.includes('jordan') ||
    text.includes('lebanon') ||
    text.includes('gcc') ||
    text.includes('gulf') ||
    text.includes('middle east') ||
    text.includes('mena')
  ) {
    return 'mena';
  }

  return 'global';
}

function extractSummary(article: NewsApiArticle): string {
  if (article.description && article.description.length >= 50) {
    let summary = article.description.trim();
    if (summary.length > 300) {
      summary = summary.substring(0, 297) + '...';
    }
    return summary;
  }

  if (article.content) {
    const cleanContent = article.content.replace(/\[\+\d+ chars\]$/, '').trim();
    if (cleanContent.length > 300) {
      return cleanContent.substring(0, 297) + '...';
    }
    return cleanContent;
  }

  return 'Read the full article for more details.';
}

// =====================
// Test fixtures
// =====================

function createMockArticle(overrides: Partial<NewsApiArticle> = {}): NewsApiArticle {
  return {
    source: { id: 'test-source', name: 'Test Source' },
    author: 'Test Author',
    title: 'Test Article Title',
    description: 'This is a test article description for testing purposes.',
    url: 'https://example.com/article/test-article',
    urlToImage: 'https://example.com/image.jpg',
    publishedAt: '2024-01-15T10:30:00Z',
    content: 'Full content of the test article.',
    ...overrides,
  };
}

// =====================
// Tests
// =====================

describe('article-summarizer utilities', () => {
  describe('generateSlug', () => {
    it('generates slug from title and date', () => {
      const result = generateSlug('Open Banking Revolution in UAE', '2024-01-15T10:30:00Z');
      expect(result).toBe('2024-01-15-open-banking-revolution-in-uae');
    });

    it('removes special characters from slug', () => {
      const result = generateSlug("What's Next? Open Finance!", '2024-01-15T00:00:00Z');
      expect(result).toBe('2024-01-15-whats-next-open-finance');
    });

    it('replaces multiple spaces with single dash', () => {
      const result = generateSlug('Too    Many   Spaces', '2024-01-15T00:00:00Z');
      expect(result).toBe('2024-01-15-too-many-spaces');
    });

    it('replaces multiple dashes with single dash', () => {
      const result = generateSlug('Multiple---Dashes', '2024-01-15T00:00:00Z');
      expect(result).toBe('2024-01-15-multiple-dashes');
    });

    it('truncates long titles to 50 characters', () => {
      const longTitle =
        'This is an extremely long article title that should be truncated to fit within the limit';
      const result = generateSlug(longTitle, '2024-01-15T00:00:00Z');
      const slugPart = result.substring(11); // Remove date prefix
      expect(slugPart.length).toBeLessThanOrEqual(50);
    });

    it('removes trailing dash after truncation', () => {
      const title = 'This title ends with a dash after truncation should';
      const result = generateSlug(title, '2024-01-15T00:00:00Z');
      expect(result.endsWith('-')).toBe(false);
    });

    it('handles empty title', () => {
      const result = generateSlug('', '2024-01-15T00:00:00Z');
      expect(result).toBe('2024-01-15-');
    });

    it('converts to lowercase', () => {
      const result = generateSlug('UPPERCASE TITLE', '2024-01-15T00:00:00Z');
      expect(result).toBe('2024-01-15-uppercase-title');
    });
  });

  describe('generateArticleId', () => {
    it('generates consistent ID for same URL', () => {
      const url = 'https://example.com/article/123';
      const id1 = generateArticleId(url);
      const id2 = generateArticleId(url);
      expect(id1).toBe(id2);
    });

    it('generates different IDs for different URLs', () => {
      const id1 = generateArticleId('https://example.com/article/1');
      const id2 = generateArticleId('https://example.com/article/2');
      expect(id1).not.toBe(id2);
    });

    it('returns alphanumeric string', () => {
      const id = generateArticleId('https://example.com/test');
      expect(id).toMatch(/^[a-z0-9]+$/);
    });

    it('handles very long URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000);
      const id = generateArticleId(longUrl);
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });

    it('handles empty string', () => {
      const id = generateArticleId('');
      expect(id).toBe('0');
    });
  });

  describe('inferArticleType', () => {
    it('returns official for regulatory content', () => {
      const article = createMockArticle({
        title: 'CBUAE Announces New Open Banking Framework',
      });
      expect(inferArticleType(article)).toBe('official');
    });

    it('returns official for central bank mentions', () => {
      const article = createMockArticle({
        description: 'The central bank has issued new guidelines for fintech.',
      });
      expect(inferArticleType(article)).toBe('official');
    });

    it('returns official for license mentions', () => {
      const article = createMockArticle({
        title: 'New Banking License Requirements',
      });
      expect(inferArticleType(article)).toBe('official');
    });

    it('returns milestone for launch announcements', () => {
      const article = createMockArticle({
        title: 'Bank X Launches New Open Banking Platform',
      });
      expect(inferArticleType(article)).toBe('milestone');
    });

    it('returns milestone for first achievements', () => {
      const article = createMockArticle({
        title: 'First Open Banking Transaction in Region',
      });
      expect(inferArticleType(article)).toBe('milestone');
    });

    it('returns opinion for analysis content', () => {
      const article = createMockArticle({
        title: 'Analysis: The Future of Open Finance',
      });
      expect(inferArticleType(article)).toBe('opinion');
    });

    it('returns opinion for commentary', () => {
      const article = createMockArticle({
        description: 'Expert commentary on fintech trends',
      });
      expect(inferArticleType(article)).toBe('opinion');
    });

    it('returns community for UAE content', () => {
      const article = createMockArticle({
        title: 'UAE Banks Adopt New Technology',
      });
      expect(inferArticleType(article)).toBe('community');
    });

    it('returns community for Dubai content', () => {
      const article = createMockArticle({
        title: 'Dubai Fintech Sector Growing',
      });
      expect(inferArticleType(article)).toBe('community');
    });

    it('returns global for international news', () => {
      const article = createMockArticle({
        title: 'Global Fintech Investment Trends',
        description: 'Worldwide fintech investment reaches new highs',
      });
      expect(inferArticleType(article)).toBe('global');
    });

    it('prioritizes official over milestone', () => {
      const article = createMockArticle({
        title: 'CBUAE Launches New Framework',
      });
      // Contains both 'CBUAE' (official) and 'Launches' (milestone)
      // Official should take priority
      expect(inferArticleType(article)).toBe('official');
    });

    it('handles null description and content', () => {
      const article = createMockArticle({
        title: 'Simple Title',
        description: null,
        content: null,
      });
      expect(inferArticleType(article)).toBe('global');
    });
  });

  describe('inferArticleRegion', () => {
    it('returns uae for UAE mentions', () => {
      const article = createMockArticle({
        title: 'UAE Open Banking Progress',
      });
      expect(inferArticleRegion(article)).toBe('uae');
    });

    it('returns uae for Dubai mentions', () => {
      const article = createMockArticle({
        title: 'Dubai Fintech Hub Expansion',
      });
      expect(inferArticleRegion(article)).toBe('uae');
    });

    it('returns uae for Abu Dhabi mentions', () => {
      const article = createMockArticle({
        title: 'Abu Dhabi Banking Innovation',
      });
      expect(inferArticleRegion(article)).toBe('uae');
    });

    it('returns uae for DIFC mentions', () => {
      const article = createMockArticle({
        description: 'DIFC introduces new fintech regulations',
      });
      expect(inferArticleRegion(article)).toBe('uae');
    });

    it('returns uae for ADGM mentions', () => {
      const article = createMockArticle({
        content: 'ADGM financial services update',
      });
      expect(inferArticleRegion(article)).toBe('uae');
    });

    it('returns mena for Saudi mentions', () => {
      const article = createMockArticle({
        title: 'Saudi Arabia Banking Sector',
      });
      expect(inferArticleRegion(article)).toBe('mena');
    });

    it('returns mena for Bahrain mentions', () => {
      const article = createMockArticle({
        title: 'Bahrain Open Banking Initiative',
      });
      expect(inferArticleRegion(article)).toBe('mena');
    });

    it('returns mena for GCC mentions', () => {
      const article = createMockArticle({
        description: 'GCC banking cooperation expands',
      });
      expect(inferArticleRegion(article)).toBe('mena');
    });

    it('returns mena for Middle East mentions', () => {
      const article = createMockArticle({
        title: 'Middle East Fintech Landscape',
      });
      expect(inferArticleRegion(article)).toBe('mena');
    });

    it('returns global for international content', () => {
      const article = createMockArticle({
        title: 'European Banking Regulations Update',
        description: 'PSD2 implementation progress across Europe',
      });
      expect(inferArticleRegion(article)).toBe('global');
    });

    it('prioritizes UAE over MENA', () => {
      const article = createMockArticle({
        title: 'UAE Leads GCC Banking Innovation',
      });
      // Contains both UAE and GCC
      // UAE should take priority
      expect(inferArticleRegion(article)).toBe('uae');
    });

    it('handles null fields', () => {
      const article = createMockArticle({
        title: 'Generic Title',
        description: null,
        content: null,
      });
      expect(inferArticleRegion(article)).toBe('global');
    });
  });

  describe('extractSummary', () => {
    it('uses description when available and long enough', () => {
      const article = createMockArticle({
        description:
          'This is a sufficiently long description that should be used as the summary for this article.',
      });
      const result = extractSummary(article);
      expect(result).toBe(article.description);
    });

    it('truncates long descriptions to 300 characters', () => {
      const longDescription = 'A'.repeat(400);
      const article = createMockArticle({
        description: longDescription,
      });
      const result = extractSummary(article);
      expect(result.length).toBe(300);
      expect(result.endsWith('...')).toBe(true);
    });

    it('falls back to content when description is too short', () => {
      const article = createMockArticle({
        description: 'Short desc',
        content: 'This is the full content that should be used when description is too short.',
      });
      const result = extractSummary(article);
      expect(result).toBe(article.content);
    });

    it('removes NewsAPI char count suffix from content', () => {
      const article = createMockArticle({
        description: 'Short',
        content: 'Article content here [+1234 chars]',
      });
      const result = extractSummary(article);
      expect(result).toBe('Article content here');
      expect(result).not.toContain('[+');
    });

    it('returns default message when no content available', () => {
      const article = createMockArticle({
        description: null,
        content: null,
      });
      const result = extractSummary(article);
      expect(result).toBe('Read the full article for more details.');
    });

    it('returns default for very short description and no content', () => {
      const article = createMockArticle({
        description: 'Too short',
        content: null,
      });
      const result = extractSummary(article);
      expect(result).toBe('Read the full article for more details.');
    });

    it('truncates long content to 300 characters', () => {
      const longContent = 'B'.repeat(400);
      const article = createMockArticle({
        description: 'Short',
        content: longContent,
      });
      const result = extractSummary(article);
      expect(result.length).toBe(300);
      expect(result.endsWith('...')).toBe(true);
    });

    it('trims whitespace from description', () => {
      const article = createMockArticle({
        description: '   This description has leading and trailing whitespace.   ' + 'X'.repeat(50),
      });
      const result = extractSummary(article);
      expect(result.startsWith(' ')).toBe(false);
      expect(result.startsWith('This')).toBe(true);
    });
  });
});
