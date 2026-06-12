import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(20).max(200),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    category: z.string().min(1),
    tags: z.array(z.string().min(1)).default([]),
    draft: z.boolean(),
    image: z.string().optional(),
    author: z.string().optional(),
  }),
});

export const collections = { articles };
