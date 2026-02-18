import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    articles: defineCollection({
      type: 'page',
      source: 'articles/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        readingTime: z.number().optional(),
        tags: z.array(z.string()).optional(),
      })
    }),
    projects: defineCollection({
      type: 'page',
      source: 'projects/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string().optional(),
        technologies: z.array(z.string()).optional(),
        github: z.string().optional(),
        demo: z.string().optional(),
      })
    })
  }
})
