import { defineCollection, z } from 'astro:content';

const newsTypes = ['official', 'milestone', 'community', 'global', 'opinion'] as const;

const newsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    type: z.enum(newsTypes),
    author: z.string().default('Community'),
    source: z.string().url().optional(),
    description: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  news: newsCollection,
};
