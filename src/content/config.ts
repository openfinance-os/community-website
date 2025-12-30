import { defineCollection, z } from 'astro:content';

const newsTypes = ['official', 'milestone', 'community', 'global', 'opinion'] as const;
const eventTypes = ['meetup', 'hackathon', 'webinar', 'conference', 'workshop'] as const;

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

export const collections = {
  news: newsCollection,
  events: eventsCollection,
};
