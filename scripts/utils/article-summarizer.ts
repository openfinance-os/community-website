// AI-powered article summarization using Anthropic Claude API
// Falls back to article description if no API key is provided (free mode)
import type { NewsApiArticle, CuratedArticle } from '../types/news-curation.js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export interface SummarizerOptions {
  apiKey?: string; // Optional - falls back to description if not provided
  model?: string;
  enhanced?: boolean; // Use enhanced prompt with additional analysis
}

interface AnthropicResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

interface SummaryResult {
  summary: string;
  type: 'global' | 'community' | 'milestone' | 'official' | 'opinion';
  region: 'uae' | 'mena' | 'global';
}

interface EnhancedSummaryResult extends SummaryResult {
  relevance?: string; // Why this matters to open banking professionals
  keyQuote?: string; // Most impactful quote from the article
  audience?: Array<'developers' | 'business' | 'regulators' | 'consumers'>;
  actionability?: 'low' | 'medium' | 'high';
}

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

// Determine article type based on keywords (used when no AI available)
function inferArticleType(
  article: NewsApiArticle
): 'global' | 'community' | 'milestone' | 'official' | 'opinion' {
  const text =
    `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();

  // Check for official/regulatory content
  if (
    text.includes('cbuae') ||
    text.includes('central bank') ||
    text.includes('regulation') ||
    text.includes('regulatory') ||
    text.includes('license') ||
    text.includes('framework') ||
    text.includes('fca') ||
    text.includes('eba') ||
    text.includes('obie') ||
    text.includes('sama') ||
    text.includes('difc') ||
    text.includes('adgm')
  ) {
    return 'official';
  }

  // Check for milestone content
  if (
    text.includes('first') ||
    text.includes('launch') ||
    text.includes('milestone') ||
    text.includes('achievement') ||
    text.includes('record') ||
    text.includes('raises') ||
    text.includes('funding') ||
    text.includes('acquires') ||
    text.includes('partnership')
  ) {
    return 'milestone';
  }

  // Check for opinion/analysis
  if (
    text.includes('opinion') ||
    text.includes('analysis') ||
    text.includes('commentary') ||
    text.includes('perspective') ||
    text.includes('insight') ||
    text.includes('outlook')
  ) {
    return 'opinion';
  }

  // Check for community/local
  if (
    text.includes('uae') ||
    text.includes('dubai') ||
    text.includes('abu dhabi') ||
    text.includes('emirates') ||
    text.includes('gcc') ||
    text.includes('gulf')
  ) {
    return 'community';
  }

  return 'global';
}

// Determine article region based on keywords (used when no AI available)
function inferArticleRegion(article: NewsApiArticle): 'uae' | 'mena' | 'global' {
  const text =
    `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();

  // Check for UAE-specific content
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
    text.includes('al tareq') ||
    text.includes('lean technologies') ||
    text.includes('tarabut gateway')
  ) {
    return 'uae';
  }

  // Check for MENA region content (excluding UAE which is caught above)
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
    text.includes('mena') ||
    text.includes('sama')
  ) {
    return 'mena';
  }

  return 'global';
}

// Infer audience based on content (used when no AI available)
function inferAudience(
  article: NewsApiArticle
): Array<'developers' | 'business' | 'regulators' | 'consumers'> {
  const text =
    `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  const audience: Array<'developers' | 'business' | 'regulators' | 'consumers'> = [];

  // Developer signals
  if (
    text.includes('api') ||
    text.includes('sdk') ||
    text.includes('developer') ||
    text.includes('integration') ||
    text.includes('technical') ||
    text.includes('platform')
  ) {
    audience.push('developers');
  }

  // Business signals
  if (
    text.includes('revenue') ||
    text.includes('business') ||
    text.includes('market') ||
    text.includes('growth') ||
    text.includes('strategy') ||
    text.includes('partnership')
  ) {
    audience.push('business');
  }

  // Regulator signals
  if (
    text.includes('regulation') ||
    text.includes('compliance') ||
    text.includes('license') ||
    text.includes('framework') ||
    text.includes('guideline') ||
    text.includes('central bank')
  ) {
    audience.push('regulators');
  }

  // Consumer signals
  if (
    text.includes('consumer') ||
    text.includes('customer') ||
    text.includes('user') ||
    text.includes('experience') ||
    text.includes('app') ||
    text.includes('service')
  ) {
    audience.push('consumers');
  }

  // Default to business if no specific audience detected
  if (audience.length === 0) {
    audience.push('business');
  }

  return audience;
}

// Simple extractive summary when no AI is available
function extractSummary(article: NewsApiArticle): string {
  // Use description if available and reasonable length
  if (article.description && article.description.length >= 50) {
    // Clean up and truncate if needed
    let summary = article.description.trim();
    if (summary.length > 300) {
      summary = summary.substring(0, 297) + '...';
    }
    return summary;
  }

  // Fall back to content excerpt
  if (article.content) {
    // Remove the "[+XXXX chars]" suffix that NewsAPI adds
    const cleanContent = article.content.replace(/\[\+\d+ chars\]$/, '').trim();
    if (cleanContent.length > 300) {
      return cleanContent.substring(0, 297) + '...';
    }
    return cleanContent;
  }

  return 'Read the full article for more details.';
}

// Extract a potential quote from the article
function extractQuote(article: NewsApiArticle): string | undefined {
  const content = article.description || article.content || '';

  // Look for quoted text
  const quoteMatch = content.match(/"([^"]{20,150})"/);
  if (quoteMatch) {
    return quoteMatch[1];
  }

  // Also try curly quotes
  const curlyQuoteMatch = content.match(/"([^"]{20,150})"/);
  if (curlyQuoteMatch) {
    return curlyQuoteMatch[1];
  }

  return undefined;
}

async function callClaude(
  prompt: string,
  systemPrompt: string,
  options: SummarizerOptions
): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': options.apiKey!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: options.model || 'claude-3-haiku-20240307',
      max_tokens: options.enhanced ? 400 : 200,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data: AnthropicResponse = await response.json();
  return data.content[0]?.text || '';
}

// Enhanced system prompt for better article analysis
const ENHANCED_SYSTEM_PROMPT = `You are an expert open banking analyst for the UAE Open Finance community website. Your task is to analyze news articles and provide structured insights.

For each article, provide a JSON response with:

1. "summary": A 2-3 sentence summary that captures the key news and its significance. Focus on facts and impact, not just repeating the headline.

2. "type": Classify as one of:
   - "official" - Regulatory announcements, central bank news, licensing, policy updates
   - "milestone" - Product launches, funding rounds, partnerships, acquisitions, market firsts
   - "opinion" - Analysis, commentary, predictions, expert insights
   - "community" - Local ecosystem news, events, UAE/GCC-specific developments
   - "global" - International industry news and trends

3. "region": Classify as one of:
   - "uae" - Specifically about UAE (mentions UAE, Dubai, Abu Dhabi, CBUAE, DIFC, ADGM, or UAE companies)
   - "mena" - Middle East & North Africa (Saudi, Bahrain, Qatar, Kuwait, GCC, etc.) but not UAE
   - "global" - International/worldwide news

4. "relevance": One sentence explaining why this matters to open banking professionals in the UAE/MENA region. Be specific about the implications.

5. "keyQuote": The most impactful direct quote from the article, if any. Omit if no good quote exists.

6. "audience": Array of who should read this, from: ["developers", "business", "regulators", "consumers"]
   - developers: Technical implementation, APIs, platforms, integration
   - business: Strategy, revenue, market, partnerships
   - regulators: Compliance, policy, licensing, frameworks
   - consumers: End-user impact, services, experience

7. "actionability": How actionable is this news?
   - "high" - Requires immediate attention or action (new regulations, major launches)
   - "medium" - Worth monitoring or planning for (industry trends, upcoming changes)
   - "low" - Informational only (general news, commentary)

Respond ONLY with valid JSON, no other text.`;

const BASIC_SYSTEM_PROMPT = `You are a news summarizer for the UAE Open Finance community website.
Your task is to:
1. Write a 2-3 sentence summary of the article that is informative and relevant to the open finance/fintech community
2. Classify the article type as one of: global (international news), community (local ecosystem), milestone (significant achievement), official (regulatory/government), opinion (analysis/commentary)
3. Classify the article region as one of: uae (specifically about the UAE), mena (Middle East & North Africa excluding UAE), global (international/worldwide)

Respond in JSON format only: {"summary": "...", "type": "...", "region": "..."}`;

export async function summarizeArticle(
  article: NewsApiArticle,
  options: SummarizerOptions
): Promise<EnhancedSummaryResult> {
  // If no API key, use free mode (extractive summary)
  if (!options.apiKey) {
    console.log('  (Using free mode - no AI summarization)');
    return {
      summary: extractSummary(article),
      type: inferArticleType(article),
      region: inferArticleRegion(article),
      audience: inferAudience(article),
      keyQuote: extractQuote(article),
      actionability: 'low',
    };
  }

  const useEnhanced = options.enhanced !== false; // Default to enhanced
  const systemPrompt = useEnhanced ? ENHANCED_SYSTEM_PROMPT : BASIC_SYSTEM_PROMPT;

  const prompt = useEnhanced
    ? `Analyze this article for the UAE Open Finance community:

Title: ${article.title}
Source: ${article.source.name}
Published: ${article.publishedAt}
Description: ${article.description || 'N/A'}
Content: ${article.content || 'N/A'}

Respond only with valid JSON matching the schema described.`
    : `Summarize this article for the UAE Open Finance community:

Title: ${article.title}
Source: ${article.source.name}
Description: ${article.description || 'N/A'}
Content: ${article.content || 'N/A'}

Respond only with valid JSON.`;

  try {
    const response = await callClaude(prompt, systemPrompt, options);

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }

    const result = JSON.parse(jsonMatch[0]);

    const enhancedResult: EnhancedSummaryResult = {
      summary: result.summary || article.description || '',
      type: result.type || inferArticleType(article),
      region: result.region || inferArticleRegion(article),
    };

    // Add enhanced fields if available
    if (result.relevance) {
      enhancedResult.relevance = result.relevance;
    }
    if (result.keyQuote) {
      enhancedResult.keyQuote = result.keyQuote;
    }
    if (result.audience && Array.isArray(result.audience)) {
      enhancedResult.audience = result.audience;
    }
    if (result.actionability) {
      enhancedResult.actionability = result.actionability;
    }

    return enhancedResult;
  } catch (error) {
    console.warn(`  Failed to summarize with AI, using fallback: ${error}`);
    return {
      summary: extractSummary(article),
      type: inferArticleType(article),
      region: inferArticleRegion(article),
      audience: inferAudience(article),
      keyQuote: extractQuote(article),
      actionability: 'low',
    };
  }
}

export async function processArticles(
  articles: NewsApiArticle[],
  scores: Map<string, number>,
  options: SummarizerOptions
): Promise<CuratedArticle[]> {
  const curatedArticles: CuratedArticle[] = [];
  const useAI = !!options.apiKey;

  if (!useAI) {
    console.log('\nNo ANTHROPIC_API_KEY provided - using free mode (article descriptions)\n');
  } else {
    console.log('\nUsing enhanced AI summarization with relevance analysis\n');
  }

  for (const article of articles) {
    console.log(`Processing: ${article.title.substring(0, 50)}...`);

    try {
      const result = await summarizeArticle(article, { ...options, enhanced: true });

      const curated: CuratedArticle = {
        id: generateArticleId(article.url),
        title: article.title,
        source: article.source.name,
        sourceUrl: article.url,
        publishedAt: article.publishedAt,
        description: article.description || '',
        summary: result.summary,
        relevanceScore: scores.get(article.url) || 0,
        type: result.type,
        region: result.region,
        slug: generateSlug(article.title, article.publishedAt),
      };

      // Log enhanced analysis if available
      if (result.relevance) {
        console.log(`  Relevance: ${result.relevance}`);
      }
      if (result.audience) {
        console.log(`  Audience: ${result.audience.join(', ')}`);
      }
      if (result.actionability) {
        console.log(`  Actionability: ${result.actionability}`);
      }

      curatedArticles.push(curated);

      // Small delay only if using AI to avoid rate limiting
      if (useAI) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Failed to process article: ${article.title}`, error);
    }
  }

  return curatedArticles;
}
