import { z } from 'zod'
import { blogPublishStatusValues } from '@/lib/validations/blog-form.validation'

export const adminBlogListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional(),
})

export const adminBlogPublishStatusSchema = z.object({
  publishStatus: z.enum(blogPublishStatusValues),
})

export type AdminBlogListQuery = z.infer<typeof adminBlogListQuerySchema>
