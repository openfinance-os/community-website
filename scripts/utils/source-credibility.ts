// Source credibility tracking for news curation
// Tracks historical performance of news sources to improve future scoring

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CREDIBILITY_FILE = join(__dirname, '../../data/news-curation/source-credibility.json');

export interface SourceCredibility {
  domain: string;
  displayName: string;
  articlesProposed: number; // Total articles proposed via PR
  articlesPublished: number; // PRs that were merged
  articlesRejected: number; // PRs that were closed without merge
  averageRelevanceScore: number;
  lastUpdated: string;
  firstSeen: string;
}

export interface CredibilityData {
  version: string;
  lastUpdated: string;
  sources: SourceCredibility[];
}

/**
 * Load credibility data from file
 */
export function loadCredibilityData(): CredibilityData {
  if (!existsSync(CREDIBILITY_FILE)) {
    return {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      sources: [],
    };
  }

  try {
    const data = readFileSync(CREDIBILITY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('Failed to load credibility data, starting fresh:', error);
    return {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      sources: [],
    };
  }
}

/**
 * Save credibility data to file
 */
export function saveCredibilityData(data: CredibilityData): void {
  data.lastUpdated = new Date().toISOString();
  writeFileSync(CREDIBILITY_FILE, JSON.stringify(data, null, 2));
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Record that an article was proposed (PR created)
 */
export function recordArticleProposed(
  sourceUrl: string,
  sourceName: string,
  relevanceScore: number
): void {
  const data = loadCredibilityData();
  const domain = extractDomain(sourceUrl);

  let source = data.sources.find((s) => s.domain === domain);
  if (!source) {
    source = {
      domain,
      displayName: sourceName,
      articlesProposed: 0,
      articlesPublished: 0,
      articlesRejected: 0,
      averageRelevanceScore: 0,
      lastUpdated: new Date().toISOString(),
      firstSeen: new Date().toISOString(),
    };
    data.sources.push(source);
  }

  // Update running average
  const totalScore = source.averageRelevanceScore * source.articlesProposed + relevanceScore;
  source.articlesProposed += 1;
  source.averageRelevanceScore = Math.round((totalScore / source.articlesProposed) * 100) / 100;
  source.lastUpdated = new Date().toISOString();

  saveCredibilityData(data);
}

/**
 * Record that an article was published (PR merged)
 */
export function recordArticlePublished(sourceUrl: string): void {
  const data = loadCredibilityData();
  const domain = extractDomain(sourceUrl);

  const source = data.sources.find((s) => s.domain === domain);
  if (source) {
    source.articlesPublished += 1;
    source.lastUpdated = new Date().toISOString();
    saveCredibilityData(data);
  }
}

/**
 * Record that an article was rejected (PR closed without merge)
 */
export function recordArticleRejected(sourceUrl: string): void {
  const data = loadCredibilityData();
  const domain = extractDomain(sourceUrl);

  const source = data.sources.find((s) => s.domain === domain);
  if (source) {
    source.articlesRejected += 1;
    source.lastUpdated = new Date().toISOString();
    saveCredibilityData(data);
  }
}

/**
 * Get credibility bonus for a source based on historical performance
 * Returns a value between -10 and +15
 */
export function getCredibilityBonus(sourceUrl: string): number {
  const data = loadCredibilityData();
  const domain = extractDomain(sourceUrl);

  const source = data.sources.find((s) => s.domain === domain);
  if (!source || source.articlesProposed < 3) {
    // Not enough data to make a judgment
    return 0;
  }

  // Calculate merge rate
  const mergeRate = source.articlesPublished / source.articlesProposed;

  // Scale: 0% merge rate = -10, 50% = 0, 100% = +15
  if (mergeRate >= 0.5) {
    return Math.round((mergeRate - 0.5) * 30); // 0 to 15
  } else {
    return Math.round((mergeRate - 0.5) * 20); // -10 to 0
  }
}

/**
 * Get credibility report for all tracked sources
 */
export function getCredibilityReport(): string {
  const data = loadCredibilityData();

  if (data.sources.length === 0) {
    return 'No source credibility data available yet.';
  }

  // Sort by merge rate descending
  const sorted = [...data.sources].sort((a, b) => {
    const rateA = a.articlesProposed > 0 ? a.articlesPublished / a.articlesProposed : 0;
    const rateB = b.articlesProposed > 0 ? b.articlesPublished / b.articlesProposed : 0;
    return rateB - rateA;
  });

  let report = 'Source Credibility Report\n';
  report += '='.repeat(60) + '\n\n';

  for (const source of sorted) {
    const mergeRate =
      source.articlesProposed > 0
        ? Math.round((source.articlesPublished / source.articlesProposed) * 100)
        : 0;
    const bonus = getCredibilityBonus(`https://${source.domain}`);

    report += `${source.displayName} (${source.domain})\n`;
    report += `  Proposed: ${source.articlesProposed} | Published: ${source.articlesPublished} | Rejected: ${source.articlesRejected}\n`;
    report += `  Merge Rate: ${mergeRate}% | Avg Score: ${source.averageRelevanceScore} | Bonus: ${bonus >= 0 ? '+' : ''}${bonus}\n`;
    report += `  First seen: ${source.firstSeen.split('T')[0]} | Last updated: ${source.lastUpdated.split('T')[0]}\n`;
    report += '\n';
  }

  return report;
}

/**
 * Get sources that should be deprioritized (low merge rate with enough data)
 */
export function getLowPerformingSources(): string[] {
  const data = loadCredibilityData();

  return data.sources
    .filter((s) => {
      if (s.articlesProposed < 5) return false; // Need enough data
      const mergeRate = s.articlesPublished / s.articlesProposed;
      return mergeRate < 0.2; // Less than 20% merge rate
    })
    .map((s) => s.domain);
}

/**
 * Get sources that should be prioritized (high merge rate with enough data)
 */
export function getHighPerformingSources(): string[] {
  const data = loadCredibilityData();

  return data.sources
    .filter((s) => {
      if (s.articlesProposed < 5) return false; // Need enough data
      const mergeRate = s.articlesPublished / s.articlesProposed;
      return mergeRate > 0.7; // More than 70% merge rate
    })
    .map((s) => s.domain);
}
