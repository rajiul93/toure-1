import { z } from 'zod'

export const KNOWLEDGE_BASE_CATEGORIES = [
  'GENERAL',
  'HOURS',
  'TICKETS',
  'BOOKING',
  'TRAVEL',
  'VISITOR_INFO',
  'RULES',
  'FAQ',
  'OTHER',
] as const

export const knowledgeBaseCategorySchema = z.enum(KNOWLEDGE_BASE_CATEGORIES)

export const knowledgeBaseFormSchema = z.object({
  tourSlug: z.string().trim(),
  category: knowledgeBaseCategorySchema,
  question: z.string().trim().min(3, 'Question must be at least 3 characters'),
  answer: z.string().trim().min(1, 'Answer is required'),
  isPublished: z.boolean(),
  sortOrder: z.number().int().min(0),
})

export const knowledgeBaseSubmissionSchema = knowledgeBaseFormSchema

export function createEmptyKnowledgeBaseValues() {
  return {
    tourSlug: '',
    category: 'GENERAL' as const,
    question: '',
    answer: '',
    isPublished: true,
    sortOrder: 0,
  }
}
