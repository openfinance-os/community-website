// AI-powered article summarization using OpenAI API
import type { NewsApiArticle, CuratedArticle } from '../types/news-curation.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface SummarizerOptions {
  apiKey: string;
  model?: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface SummaryResult {
  summary: string;
  type: 'global' | 'community' | 'milestone' | 'official' | 'opinion';
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
  // Create a simple hash from the URL
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

async function callOpenAI(
  prompt: string,
  systemPrompt: string,
  options: SummarizerOptions
): Promise<string> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data: OpenAIResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}

export async function summarizeArticle(
  article: NewsApiArticle,
  options: SummarizerOptions
): Promise<SummaryResult> {
  const systemPrompt = `You are a news summarizer for the UAE Open Finance community website.
Your task is to:
1. Write a 2-3 sentence summary of the article that is informative and relevant to the open finance/fintech community
2. Classify the article type as one of: global (international news), community (local ecosystem), milestone (significant achievement), official (regulatory/government), opinion (analysis/commentary)

Respond in JSON format: {"summary": "...", "type": "..."}`;

  const prompt = `Summarize this article for the UAE Open Finance community:

Title: ${article.title}
Source: ${article.source.name}
Description: ${article.description || 'N/A'}
Content: ${article.content || 'N/A'}

Remember to respond only with valid JSON.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt, options);

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      summary: result.summary || article.description || '',
      type: result.type || 'global',
    };
  } catch (error) {
    console.warn(`Failed to summarize article, using description: ${error}`);
    // Fallback to description
    return {
      summary: article.description || 'No summary available.',
      type: 'global',
    };
  }
}

export async function processArticles(
  articles: NewsApiArticle[],
  scores: Map<string, number>,
  options: SummarizerOptions
): Promise<CuratedArticle[]> {
  const curatedArticles: CuratedArticle[] = [];

  for (const article of articles) {
    console.log(`Summarizing: ${article.title.substring(0, 50)}...`);

    try {
      const { summary, type } = await summarizeArticle(article, options);

      const curated: CuratedArticle = {
        id: generateArticleId(article.url),
        title: article.title,
        source: article.source.name,
        sourceUrl: article.url,
        publishedAt: article.publishedAt,
        description: article.description || '',
        summary,
        relevanceScore: scores.get(article.url) || 0,
        type,
        slug: generateSlug(article.title, article.publishedAt),
      };

      curatedArticles.push(curated);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to process article: ${article.title}`, error);
    }
  }

  return curatedArticles;
}
