import { defineCollection, z } from 'astro:content';

const newsTypes = ['official', 'milestone', 'community', 'global', 'opinion'] as const;
const eventTypes = ['meetup', 'hackathon', 'webinar', 'conference', 'workshop'] as const;
const ideaCategories = ['consumer', 'business', 'developer', 'integration', 'analytics'] as const;
const ideaStatuses = ['idea', 'in-progress', 'built'] as const;
const ideaComplexities = ['beginner', 'intermediate', 'advanced'] as const;

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

const eventsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    type: z.enum(eventTypes),
    location: z.string(),
    isOnline: z.boolean().default(false),
    organizer: z.string(),
    url: z.string().url().optional(),
    lumaEventId: z.string().optional(),
    description: z.string(),
    featured: z.boolean().default(false),
  }),
});

const ideasCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(ideaCategories),
    status: z.enum(ideaStatuses).default('idea'),
    complexity: z.enum(ideaComplexities).default('intermediate'),
    author: z.string().default('Community'),
    description: z.string(),
    apis: z.array(z.string()).default([]),
    demoUrl: z.string().url().optional(),
    repoUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  news: newsCollection,
  events: eventsCollection,
  ideas: ideasCollection,
};
