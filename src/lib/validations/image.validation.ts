import { z } from 'zod'

export const imageUsageSchema = z.object({
  entityType: z.string().trim().min(1).max(64),
  entityId: z.string().trim().min(1).max(128),
  field: z.string().trim().min(1).max(64).default('default'),
})

export const registerImageUsageSchema = imageUsageSchema.extend({
  imageId: z.string().trim().min(1),
})

export const listImagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  search: z.string().trim().optional(),
})

export type RegisterImageUsageInput = z.infer<typeof registerImageUsageSchema>
