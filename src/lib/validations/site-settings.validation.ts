import { SITE_ABOUT_ICON_KEYS } from '@/lib/about-value-icons'
import { getDefaultSiteSettingsInput } from '@/lib/site-config.defaults'
import { z } from 'zod'

const pendingImageUrlSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || value.startsWith('blob:') || z.string().url().safeParse(value).success, {
    message: 'Select an image or enter a valid URL',
  })

const siteLinkSchema = z.object({
  href: z.string().trim().min(1, 'Link path is required'),
  label: z.string().trim().min(1, 'Link label is required'),
})

const siteAboutValueSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  icon: z.enum(SITE_ABOUT_ICON_KEYS),
})

export const siteSettingsSchema = z.object({
  brand: z.object({
    name: z.string().trim().min(1, 'Brand name is required'),
    script: z.string().trim().min(1, 'Brand script is required'),
    logo: z.object({
      url: pendingImageUrlSchema,
      alt_text: z.string().trim(),
    }),
  }),
  tagline: z.string().trim().min(1, 'Tagline is required'),
  footerDescription: z.string().trim().min(1, 'Footer description is required'),
  contact: z.object({
    whatsappNumber: z.string().trim().min(6, 'WhatsApp number is required'),
    whatsappNavLabel: z.string().trim().min(1, 'Nav label is required'),
    whatsappCtaLabel: z.string().trim().min(1, 'CTA label is required'),
  }),
  bokun: z.object({
    channel: z.string().trim().min(1, 'Bokun channel is required'),
    experienceId: z.string().trim().min(1, 'Experience ID is required'),
  }),
  booking: z.object({
    features: z.array(z.string().trim().min(1)).min(1, 'Add at least one feature'),
    trustBadges: z
      .array(
        z.object({
          label: z.string().trim().min(1, 'Badge label is required'),
          tone: z.enum(['primary', 'sky']),
        }),
      )
      .length(2),
  }),
  about: z.object({
    metadataDescription: z.string().trim().min(1, 'Metadata description is required'),
    heroDescription: z.string().trim().min(1, 'Hero description is required'),
    whatWeDo: z.tuple([z.string().trim().min(1), z.string().trim().min(1)]),
    values: z.tuple([siteAboutValueSchema, siteAboutValueSchema, siteAboutValueSchema]),
    closing: z.string().trim().min(1, 'Closing paragraph is required'),
  }),
  legal: z.array(siteLinkSchema).min(1),
  footerPages: z.array(siteLinkSchema).min(1),
})

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>

export function createEmptySiteSettingsValues(): SiteSettingsFormValues {
  return getDefaultSiteSettingsInput()
}
