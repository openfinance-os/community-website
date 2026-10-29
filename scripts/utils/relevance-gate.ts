// Stricter relevance gate for the news curator.
//
// The score in news-api-client.ts still ranks candidates, but a high score is
// not enough to publish. UAE + fintech wording was clearing the regional
// threshold for stories that are not about open finance (a Messi card
// giveaway, a Qatar asset-management scheme). This gate asks a narrower
// question: is the item about open finance, open banking, or the UAE
// programme (CBUAE Open Finance, Nebras, AlTareq, the API Hub, Ozone Connect,
// CAAP, Aani)? Vocabulary follows the MiddleLeap UAE Open Finance skill:
// AlTareq is the consumer brand, Nebras operates the API Hub, CBUAE regulates,
// LFIs execute, and TPPs never call an LFI directly.
//
// Confidence is calibrated on the last 72 bot news PRs (10 merged, 54 closed,
// 8 open) stored in scripts/utils/__tests__/fixtures/news-pr-labels.json.
// Merged is the positive label, closed-unmerged is the negative label, and
// open PRs are unlabelled. A core term in the title clears the default 0.55
// threshold on its own. A mention that only appears in the body does not,
// unless a UAE programme signal or a second core family lifts it.

import type { NewsApiArticle, NewsSourceConfig } from '../types/news-curation.js';

/** Phrases and acronyms that mean this item is actually about the beat. */
export const DEFAULT_CORE_TERMS: readonly string[] = [
  'open finance',
  'open banking',
  'openbanking',
  'openfinance',
  'nebras',
  'al tareq',
  'altareq',
  'al-tareq',
  'pay by bank',
  'pay-by-bank',
  'account aggregation',
  'payment initiation',
  'account information service',
  'project aperta',
  'aperta',
  'aisp',
  'pisp',
  // UAE programme actors and standards (AlTareq brand, Nebras-operated hub).
  'api hub',
  'ozone connect',
  'ozone api',
  'caap',
  'aani',
  'service initiation',
  'bank service initiation',
  'bank data sharing',
  'confirmation of payee',
  'deemed licence',
  'deemed license',
  'screen scraping',
  'data scraping',
  'fapi',
];

/**
 * Hard exclusions. These are the off-topic patterns that reached review:
 * celebrity giveaways, asset-management products, and crypto coverage.
 * A match rejects the item even when an open-finance term is also present.
 */
export const DEFAULT_EXCLUSIONS: readonly string[] = [
  'messi',
  'ronaldo',
  'memorabilia',
  'giveaway',
  'chance to win',
  'sweepstakes',
  'asset management',
  'asset-management',
  'bitcoin',
  'ethereum',
  'cryptocurrency',
  'crypto',
  'nft',
  'tokenised',
  'tokenized',
  'stablecoin',
  'vara licence',
  'vara license',
  'vara approval',
  'digital asset',
  'digital assets',
  'commemorative coin',
];

/** Signals that the item is about the UAE open-finance programme specifically. */
const UAE_PROGRAMME_TERMS = [
  'nebras',
  'al tareq',
  'altareq',
  'al-tareq',
  'cbuae',
  'central bank of the uae',
  'central bank of the united arab emirates',
  'project aperta',
  'aperta',
  'api hub',
  'ozone connect',
  'ozone api',
  'caap',
  'aani',
  'deemed licence',
  'deemed license',
];

/**
 * AI agents are in scope only together with payments, a banking API, or open
 * finance. A banking software or governance story that merely says "AI agents"
 * is not enough — that is what kept generic agent launches out of the digest.
 */
const AI_AGENT_TERMS = ['ai agent', 'ai agents', 'agentic ai'];

const AI_TOPIC_CONTEXT = [
  'payment',
  'payments',
  'pay by bank',
  'pay-by-bank',
  'banking api',
  'banking apis',
  'open finance',
  'open banking',
  'openfinance',
  'openbanking',
  'api hub',
  'ozone connect',
  'nebras',
  'al tareq',
  'altareq',
  'al-tareq',
  'service initiation',
  'account information',
  'aani',
  'caap',
];

export const DEFAULT_MIN_CONFIDENCE = 0.55;

export type RelevanceReason = 'ok' | 'excluded-topic' | 'no-core-term' | 'below-confidence';

export interface RelevanceDecision {
  accept: boolean;
  /** 0–1. Title-level core terms start at 0.62; body-only mentions start at 0.48. */
  confidence: number;
  reason: RelevanceReason;
  matchedTerms: string[];
  matchedExclusions: string[];
}

export interface LabelledNewsExample {
  number: number;
  title: string;
  label: 'merged' | 'closed' | 'open';
  source: string;
  summary: string;
}

export interface PrecisionReport {
  labelled: number;
  before: {
    predicted: number;
    truePositives: number;
    falsePositives: number;
    precision: number;
  };
  after: {
    predicted: number;
    truePositives: number;
    falsePositives: number;
    falseNegatives: number;
    precision: number;
    recall: number;
  };
  falsePositives: Array<{ number: number; title: string; confidence: number }>;
  falseNegatives: Array<{ number: number; title: string; reason: RelevanceReason }>;
  openAccepted: string[];
  openRejected: string[];
}

/** Whole-word match for short tokens; substring match for phrases. Same rule as the scorer. */
function containsTerm(text: string, term: string): boolean {
  if (term.length > 4 || term.includes(' ') || term.includes('-')) {
    return text.includes(term);
  }
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(text);
}

function termFamily(term: string): string {
  if (term.includes('pay')) return 'pay-by-bank';
  if (term.includes('open')) return 'open-finance';
  if (
    term === 'nebras' ||
    term === 'al tareq' ||
    term === 'altareq' ||
    term === 'al-tareq' ||
    term === 'aperta' ||
    term === 'project aperta' ||
    term === 'api hub' ||
    term === 'ozone connect' ||
    term === 'ozone api' ||
    term === 'caap' ||
    term === 'aani' ||
    term === 'fapi' ||
    term === 'deemed licence' ||
    term === 'deemed license' ||
    term === 'ai agents'
  ) {
    return 'uae-programme';
  }
  if (
    term === 'screen scraping' ||
    term === 'data scraping' ||
    term === 'bank data sharing' ||
    term === 'confirmation of payee'
  ) {
    return 'data-access';
  }
  if (term.includes('service initiation')) return 'tpp-service';
  if (
    term === 'aisp' ||
    term === 'pisp' ||
    term.includes('payment initiation') ||
    term.includes('account information')
  ) {
    return 'tpp-service';
  }
  if (term.includes('aggregation')) return 'aggregation';
  return term;
}

function articleText(article: Pick<NewsApiArticle, 'title' | 'description' | 'content'>): string {
  return `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
}

function roundConfidence(value: number): number {
  return Math.min(0.99, Math.round(value * 100) / 100);
}

export function assessRelevance(
  article: Pick<NewsApiArticle, 'title' | 'description' | 'content'>,
  config: Pick<
    NewsSourceConfig,
    'minConfidence' | 'relevanceCoreTerms' | 'relevanceExclusions'
  > = {}
): RelevanceDecision {
  const text = articleText(article);
  const title = article.title.toLowerCase();
  const coreTerms = config.relevanceCoreTerms?.length
    ? config.relevanceCoreTerms
    : DEFAULT_CORE_TERMS;
  const exclusions = config.relevanceExclusions?.length
    ? config.relevanceExclusions
    : DEFAULT_EXCLUSIONS;
  const threshold = config.minConfidence ?? DEFAULT_MIN_CONFIDENCE;

  const matchedExclusions = exclusions.filter((term) => containsTerm(text, term.toLowerCase()));
  if (matchedExclusions.length > 0) {
    return {
      accept: false,
      confidence: 0,
      reason: 'excluded-topic',
      matchedTerms: [],
      matchedExclusions,
    };
  }

  const matchedTerms = coreTerms
    .map((term) => term.toLowerCase())
    .filter((term) => containsTerm(text, term));

  // AI agents count only when the same item is also about payments, a banking
  // API, or open finance. The two merged agent essays (credit-memo ownership,
  // bank ROI) do not make that link, so they stay out.
  const aiAgents = AI_AGENT_TERMS.some((term) => text.includes(term));
  const aiContext = AI_TOPIC_CONTEXT.some((term) => text.includes(term));
  if (aiAgents && aiContext && !matchedTerms.includes('ai agents')) {
    matchedTerms.push('ai agents');
  }

  if (matchedTerms.length === 0) {
    return {
      accept: false,
      confidence: 0,
      reason: 'no-core-term',
      matchedTerms: [],
      matchedExclusions: [],
    };
  }

  const titleHits = matchedTerms.filter((term) => containsTerm(title, term));
  let confidence = titleHits.length > 0 ? 0.62 : 0.48;

  const families = new Set(matchedTerms.map(termFamily));
  if (families.size >= 2) confidence += 0.08;

  const uaeProgramme = UAE_PROGRAMME_TERMS.some((term) => containsTerm(text, term));
  if (uaeProgramme) confidence += 0.12;

  confidence = roundConfidence(confidence);
  const accept = confidence >= threshold;
  return {
    accept,
    confidence,
    reason: accept ? 'ok' : 'below-confidence',
    matchedTerms,
    matchedExclusions: [],
  };
}

function exampleArticle(example: LabelledNewsExample): NewsApiArticle {
  return {
    source: { id: null, name: example.source || 'Unknown' },
    author: null,
    title: example.title,
    description: example.summary || null,
    url: `https://example.com/news/${example.number}`,
    urlToImage: null,
    publishedAt: '2026-10-01T00:00:00Z',
    content: example.summary || null,
  };
}

/**
 * Precision of the previous pipeline (it proposed every labelled PR) versus
 * this gate on the same titles and summaries. Open PRs are reported but are
 * not in the precision denominator.
 */
export function evaluateRelevanceGate(
  examples: LabelledNewsExample[],
  config: Pick<
    NewsSourceConfig,
    'minConfidence' | 'relevanceCoreTerms' | 'relevanceExclusions'
  > = {}
): PrecisionReport {
  const labelled = examples.filter((example) => example.label !== 'open');
  const merged = labelled.filter((example) => example.label === 'merged');
  const closed = labelled.filter((example) => example.label === 'closed');

  const falsePositives: PrecisionReport['falsePositives'] = [];
  const falseNegatives: PrecisionReport['falseNegatives'] = [];
  const openAccepted: string[] = [];
  const openRejected: string[] = [];
  let acceptedMerged = 0;
  let acceptedClosed = 0;

  for (const example of examples) {
    const decision = assessRelevance(exampleArticle(example), config);
    if (example.label === 'open') {
      (decision.accept ? openAccepted : openRejected).push(example.title);
      continue;
    }
    if (example.label === 'merged' && decision.accept) acceptedMerged += 1;
    if (example.label === 'merged' && !decision.accept) {
      falseNegatives.push({
        number: example.number,
        title: example.title,
        reason: decision.reason,
      });
    }
    if (example.label === 'closed' && decision.accept) {
      acceptedClosed += 1;
      falsePositives.push({
        number: example.number,
        title: example.title,
        confidence: decision.confidence,
      });
    }
  }

  const beforePredicted = labelled.length;
  const beforeTp = merged.length;
  const beforeFp = closed.length;
  const afterPredicted = acceptedMerged + acceptedClosed;

  return {
    labelled: labelled.length,
    before: {
      predicted: beforePredicted,
      truePositives: beforeTp,
      falsePositives: beforeFp,
      precision: beforePredicted === 0 ? 0 : beforeTp / beforePredicted,
    },
    after: {
      predicted: afterPredicted,
      truePositives: acceptedMerged,
      falsePositives: acceptedClosed,
      falseNegatives: falseNegatives.length,
      precision: afterPredicted === 0 ? 0 : acceptedMerged / afterPredicted,
      recall: merged.length === 0 ? 0 : acceptedMerged / merged.length,
    },
    falsePositives,
    falseNegatives,
    openAccepted,
    openRejected,
  };
}
