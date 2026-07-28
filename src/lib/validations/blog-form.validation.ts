import { isValidInputDate, parseInputDate, todayInputValue } from '@/lib/dayjs'
import { z } from 'zod'

const pendingImageUrlSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || value.startsWith('blob:') || z.string().url().safeParse(value).success, {
    message: 'Select an image or enter a valid URL',
  })

const imageFieldSchema = z.object({
  url: pendingImageUrlSchema,
  alt_text: z.string().trim(),
})

export const blogGalleryImageSchema = z.object({
  id: z.string().trim().min(1),
  url: pendingImageUrlSchema,
  alt_text: z.string().trim(),
})

const dateInputSchema = z
  .string()
  .trim()
  .min(1, 'Date is required')
  .refine(isValidInputDate, { message: 'Enter a valid date' })

export const blogPublishStatusValues = ['draft', 'publish'] as const

export type BlogPublishStatus = (typeof blogPublishStatusValues)[number]

export const blogPublishStatusLabels: Record<BlogPublishStatus, string> = {
  draft: 'Draft',
  publish: 'Publish',
}

export const blogFaqSchema = z.object({
  question: z.string().trim().min(1, 'Question is required'),
  answer: z.string().trim().min(1, 'Answer is required'),
})

export const blogFormSchema = z
  .object({
    basic_info: z.object({
      blog_date: dateInputSchema,
      publish_date: dateInputSchema,
      publish_status: z.enum(blogPublishStatusValues, {
        message: 'Select publish status',
      }),
      is_delete: z.boolean(),
      author_id: z.string().min(1, 'Author is required'),
      tags: z.array(z.string()),
      keywords: z.array(z.string()),
      category_id: z.string().min(1, 'Category is required'),
      country_id: z.string().min(1, 'Country is required'),
      title: z.string().trim().min(3, 'Title must be at least 3 characters'),
      slug: z
        .string()
        .trim()
        .min(3, 'Slug must be at least 3 characters')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens'),
      short_description: z.string().trim().min(10, 'Short description is required'),
      description: z.string().trim().min(1, 'Description is required'),
      featured_image: imageFieldSchema,
      gallery: z.array(blogGalleryImageSchema).max(20, 'Maximum 20 gallery images'),
      is_featured: z.boolean(),
    }),
    faqs: z.array(blogFaqSchema),
    meta_data: z.object({
      meta_title: z.string().trim().min(1, 'Meta title is required'),
      meta_description: z.string().trim().min(1, 'Meta description is required'),
      meta_image: imageFieldSchema,
    }),
    social_meta_data: z.object({
      fb_meta_title: z.string().trim(),
      fb_meta_description: z.string().trim(),
      fb_meta_image: imageFieldSchema,
    }),
  })
  .superRefine((values, ctx) => {
    const blogDate = parseInputDate(values.basic_info.blog_date)
    const publishDate = parseInputDate(values.basic_info.publish_date)

    if (
      blogDate.isValid() &&
      publishDate.isValid() &&
      publishDate.isBefore(blogDate, 'day')
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Publish date cannot be before blog date',
        path: ['basic_info', 'publish_date'],
      })
    }

  })

/**
 * Server-side schema.
 *
 * A freshly picked image lives in the form as a `blob:` preview until
 * `prepareBlogFormForSubmit` uploads it — and that runs *after* validation.
 * So the blob check must not be part of `blogFormSchema` (the client resolver),
 * or the form can never be submitted with a new image. By the time a request
 * reaches the API the swap has happened, so a leftover blob there means the
 * upload silently failed and the row would store a dead URL.
 */
export const blogSubmissionSchema = blogFormSchema.superRefine((values, ctx) => {
  const blobFields: Array<{ path: (string | number)[]; label: string; value: string }> = [
    { path: ['basic_info', 'description'], label: 'Blog content', value: values.basic_info.description },
    { path: ['basic_info', 'featured_image', 'url'], label: 'Featured image', value: values.basic_info.featured_image.url },
    { path: ['meta_data', 'meta_image', 'url'], label: 'Meta image', value: values.meta_data.meta_image.url },
    { path: ['social_meta_data', 'fb_meta_image', 'url'], label: 'Facebook image', value: values.social_meta_data.fb_meta_image.url },
  ]

  for (const field of blobFields) {
    if (field.value.includes('blob:')) {
      ctx.addIssue({
        code: 'custom',
        message: `${field.label} contains unpublished image URLs. Re-insert the images and save again.`,
        path: field.path,
      })
    }
  }

  values.faqs.forEach((faq, index) => {
    if (faq.answer.includes('blob:')) {
      ctx.addIssue({
        code: 'custom',
        message: `FAQ ${index + 1} contains unpublished inline images. Re-insert the images and save again.`,
        path: ['faqs', index, 'answer'],
      })
    }
  })

  values.basic_info.gallery.forEach((item, index) => {
    if (item.url.includes('blob:')) {
      ctx.addIssue({
        code: 'custom',
        message: `Gallery image ${index + 1} has not been uploaded yet. Save again or re-add the image.`,
        path: ['basic_info', 'gallery', index, 'url'],
      })
    }
  })
})

export type BlogFormValues = z.infer<typeof blogFormSchema>
export type BlogFaqValues = z.infer<typeof blogFaqSchema>
export type BlogGalleryImageValues = z.infer<typeof blogGalleryImageSchema>

export const blogFormTabs = [
  'basic_info',
  'faqs',
  'meta_data',
  'social_meta_data',
] as const

export type BlogFormTab = (typeof blogFormTabs)[number]

export const blogFormTabLabels: Record<BlogFormTab, string> = {
  basic_info: 'Basic Info',
  faqs: 'FAQs',
  meta_data: 'Meta Data',
  social_meta_data: 'Social Meta',
}

export function createEmptyBlogFormValues(): BlogFormValues {
  const today = todayInputValue()

  return {
    basic_info: {
      blog_date: today,
      publish_date: today,
      publish_status: 'draft',
      is_delete: false,
      author_id: '',
      tags: [],
      keywords: [],
      category_id: '',
      country_id: '',
      title: '',
      slug: '',
      short_description: '',
      description: '',
      featured_image: {
        url: '',
        alt_text: '',
      },
      gallery: [],
      is_featured: false,
    },
    faqs: [],
    meta_data: {
      meta_title: '',
      meta_description: '',
      meta_image: {
        url: '',
        alt_text: '',
      },
    },
    social_meta_data: {
      fb_meta_title: '',
      fb_meta_description: '',
      fb_meta_image: {
        url: '',
        alt_text: '',
      },
    },
  }
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
