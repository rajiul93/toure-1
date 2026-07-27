import { z } from 'zod'

export const PUBLIC_BLOG_PAGE_LIMIT = 12

export const publicBlogListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(PUBLIC_BLOG_PAGE_LIMIT).default(PUBLIC_BLOG_PAGE_LIMIT),
  search: z.string().trim().optional(),
})

export type PublicBlogListQuery = z.infer<typeof publicBlogListQuerySchema>
