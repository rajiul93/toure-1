import { getDefaultSiteSeoSettingsInput } from '@/lib/site-seo.defaults'
import { z } from 'zod'

const pendingImageUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === '' ||
      value.startsWith('blob:') ||
      value.startsWith('/') ||
      z.string().url().safeParse(value).success,
    { message: 'Select an image or enter a valid URL/path' },
  )

const seoImageSchema = z.object({
  url: pendingImageUrlSchema,
  alt_text: z.string().trim(),
})

const sitemapChangeFrequencySchema = z.enum([
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
])

const seoPageSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  keywords: z.array(z.string().trim().min(1)).min(1, 'Add at least one keyword'),
  ogImage: seoImageSchema,
  sitemapPriority: z.number().min(0).max(1),
  sitemapChangeFrequency: sitemapChangeFrequencySchema,
})

export const siteSeoSettingsSchema = z.object({
  global: z.object({
    titleTemplate: z.string().trim().min(1, 'Title template is required'),
    defaultKeywords: z.array(z.string().trim().min(1)).min(1, 'Add at least one keyword'),
    locale: z.string().trim().min(2, 'Locale is required'),
    language: z.string().trim().min(2, 'Language code is required'),
    robotsIndex: z.boolean(),
    robotsFollow: z.boolean(),
    googleSiteVerification: z.string().trim(),
    bingSiteVerification: z.string().trim(),
    yandexVerification: z.string().trim(),
  }),
  openGraph: z.object({
    siteName: z.string().trim().min(1, 'Site name is required'),
    locale: z.string().trim().min(2, 'Locale is required'),
    defaultImage: seoImageSchema.extend({
      width: z.number().int().min(200),
      height: z.number().int().min(200),
    }),
  }),
  twitter: z.object({
    card: z.enum(['summary', 'summary_large_image']),
    site: z.string().trim(),
    creator: z.string().trim(),
  }),
  organization: z.object({
    name: z.string().trim().min(1, 'Organization name is required'),
    description: z.string().trim().min(1, 'Organization description is required'),
    logo: seoImageSchema,
    sameAs: z.array(z.string().trim()),
    email: z.string().trim(),
    telephone: z.string().trim(),
  }),
  crawlers: z.object({
    allowAiBots: z.boolean(),
    disallowPaths: z.array(z.string().trim().min(1)).min(1, 'Add at least one disallow path'),
  }),
  pages: z.object({
    home: seoPageSchema,
    about: seoPageSchema,
    reviews: seoPageSchema,
    blog: seoPageSchema,
    attractionTours: seoPageSchema,
  }),
})

export type SiteSeoSettingsFormValues = z.infer<typeof siteSeoSettingsSchema>

export function createEmptySiteSeoSettingsValues(): SiteSeoSettingsFormValues {
  return getDefaultSiteSeoSettingsInput()
}

export const SEO_PAGE_LABELS: Record<keyof SiteSeoSettingsFormValues['pages'], string> = {
  home: 'Home',
  about: 'About Us',
  reviews: 'Reviews',
  blog: 'Blog',
  attractionTours: 'Attraction Tours',
}
