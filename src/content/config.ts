import { defineCollection, z } from 'astro:content';

const newsTypes = ['official', 'milestone', 'community', 'global', 'opinion'] as const;
const newsRegions = ['uae', 'mena', 'global'] as const;

// Commons taxonomy
const commonsTypes = ['insight', 'reference', 'artifact', 'utility'] as const;
const useCases = [
  'payments',
  'data',
  'underwriting',
  'sme',
  'retail',
  'compliance',
  'identity',
  'onboarding',
] as const;
const audiences = ['bank', 'tpp', 'developer', 'regulator', 'all'] as const;
const maturityLevels = ['concept', 'demo', 'production-ready'] as const;
const licenses = ['mit', 'apache-2.0', 'cc-by-4.0', 'proprietary', 'unlicensed'] as const;
const sourcePlatforms = ['github', 'substack', 'medium', 'blog', 'research', 'other'] as const;

// AI Developer Tools taxonomy
const aiToolCategories = [
  'prompt',
  'mcp-server',
  'agent',
  'ide-extension',
  'workflow',
  'knowledge-base',
  'code-generator',
  'testing-tool',
] as const;

const aiPlatforms = [
  'claude-code',
  'cursor',
  'copilot',
  'windsurf',
  'openai-codex',
  'continue-dev',
  'aider',
  'mcp',
  'platform-agnostic',
] as const;

const aiAccelerates = [
  'api-integration',
  'consent-management',
  'compliance-checking',
  'sandbox-testing',
  'security-implementation',
  'participant-onboarding',
  'data-mapping',
  'monitoring',
  'documentation',
] as const;

const newsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    type: z.enum(newsTypes),
    region: z.enum(newsRegions),
    author: z.string().default('Community'),
    source: z.string().url().optional(),
    description: z.string().optional(),
    featured: z.boolean().default(false),
    external: z.boolean().default(false),
  }),
});

const commonsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Core fields
    title: z.string(),
    type: z.enum(commonsTypes),
    summary: z.string(),
    date: z.coerce.date(),

    // Context (mandatory for references)
    whyItMatters: z.string().optional(),

    // Taxonomy
    useCases: z.array(z.enum(useCases)).default([]),
    audience: z.array(z.enum(audiences)).default(['all']),
    maturity: z.enum(maturityLevels).default('concept'),
    license: z.enum(licenses).optional(),

    // Source information
    source: z
      .object({
        platform: z.enum(sourcePlatforms),
        url: z.string().url().optional(),
      })
      .optional(),

    // Authorship
    authoredByContributor: z.boolean().default(true),
    contributor: z.string(),
    contributorUrl: z.string().url().optional(),

    // Links
    links: z
      .object({
        github: z.string().url().optional(),
        demo: z.string().url().optional(),
        docs: z.string().url().optional(),
        article: z.string().url().optional(),
      })
      .optional(),

    // Unverified proposal examples must never enter public routes or search.
    draft: z.boolean().default(false),

    // Governance
    disclaimers: z.array(z.string()).default([]),
    featured: z.boolean().default(false),

    // AI Developer Tool metadata (optional — activates enhanced display)
    aiTool: z
      .object({
        category: z.enum(aiToolCategories),
        platforms: z.array(z.enum(aiPlatforms)).min(1),
        installCommands: z
          .array(
            z.object({
              platform: z.enum(aiPlatforms),
              command: z.string(),
              label: z.string().optional(),
            })
          )
          .default([]),
        mcpTransport: z.enum(['stdio', 'http', 'sse']).optional(),
        mcpTools: z.array(z.string()).default([]),
        version: z.string().optional(),
        accelerates: z.array(z.enum(aiAccelerates)).default([]),
        snippet: z.string().optional(),
        prerequisites: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = {
  news: newsCollection,
  commons: commonsCollection,
};
