import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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

const newsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
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
  loader: glob({ pattern: '**/*.md', base: './src/content/commons' }),
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

    // Governance
    disclaimers: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  news: newsCollection,
  commons: commonsCollection,
};
