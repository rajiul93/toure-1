import { getDefaultTourSettingsInput } from '@/lib/tour-config.defaults'
import { z } from 'zod'

const pendingImageUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === '' || value.startsWith('blob:') || value.startsWith('/') || z.string().url().safeParse(value).success,
    { message: 'Select an image or enter a valid URL/path' },
  )

const tourFaqSchema = z.object({
  id: z.string().trim().min(1, 'FAQ id is required'),
  question: z.string().trim().min(1, 'Question is required'),
  answer: z.string().trim().min(1, 'Answer is required'),
})

const tourImportantInfoSchema = z.object({
  id: z.string().trim().min(1, 'Section id is required'),
  title: z.string().trim().min(1, 'Section title is required'),
  items: z.array(z.string().trim().min(1)).min(1, 'Add at least one item'),
})

const tourBannerPhotoSchema = z.object({
  url: pendingImageUrlSchema,
  alt_text: z.string().trim().min(1, 'Alt text is required'),
  label: z.string().trim().min(1, 'Label is required'),
})

export const tourSettingsSchema = z.object({
  tour: z.object({
    name: z.string().trim().min(1, 'Tour name is required'),
    title: z.string().trim().min(1, 'Page title is required'),
    description: z.string().trim().min(1, 'Description is required'),
    shortDescription: z.string().trim().min(1, 'Short description is required'),
    price: z.number().min(0, 'Price must be zero or greater'),
    priceCurrency: z.enum(['EUR']),
    priceLabel: z.string().trim().min(1, 'Price label is required'),
    rating: z.number().min(0).max(5),
    reviewCount: z.number().int().min(0),
    reviewCountLabel: z.string().trim().min(1, 'Review count label is required'),
    duration: z.string().trim().min(1, 'Duration code is required'),
    durationLabel: z.string().trim().min(1, 'Duration label is required'),
    destination: z.string().trim().min(1, 'Destination is required'),
    meetingPoint: z.string().trim().min(1, 'Meeting point is required'),
    meetingPointCoords: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    ogImage: z.object({
      url: pendingImageUrlSchema,
      alt_text: z.string().trim(),
    }),
    slug: z.string().trim().min(1, 'Slug is required'),
    href: z.string().trim().min(1, 'Href is required'),
    keywords: z.array(z.string().trim().min(1)).min(1, 'Add at least one keyword'),
    brand: z.string().trim().min(1, 'Brand label is required'),
  }),
  faqs: z.array(tourFaqSchema).min(1, 'Add at least one FAQ'),
  importantInfo: z.array(tourImportantInfoSchema).min(1, 'Add at least one info section'),
  bannerPhotos: z.tuple([
    tourBannerPhotoSchema,
    tourBannerPhotoSchema,
    tourBannerPhotoSchema,
    tourBannerPhotoSchema,
    tourBannerPhotoSchema,
  ]),
})

export type TourSettingsFormValues = z.infer<typeof tourSettingsSchema>

export function createEmptyTourSettingsValues(): TourSettingsFormValues {
  return getDefaultTourSettingsInput()
}

export function slugifyTourId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}
