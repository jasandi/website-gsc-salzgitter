import { defineCollection, z } from 'astro:content';

const pageCollection = defineCollection({
  type: 'content',
  schema: z.object({
    titel: z.string(),
    bild: z.string().optional(),
    kurzbeschreibung: z.string().optional(),
  }),
});

const newsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    titel: z.string(),
    datum: z.string().optional(),
    bild: z.string().optional(),
    kurzbeschreibung: z.string().optional(),
  }),
});

export const collections = {
  strecken: pageCollection,
  verein: pageCollection,
  initiativen: pageCollection,
  neuigkeiten: newsCollection,
};
