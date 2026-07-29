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

const itineraryStopSchema = z.object({
  id: z.string().trim().min(1, 'Stop id is required'),
  kind: z.enum(['meeting', 'stop', 'end']),
  // Assigned automatically from `kind` order — the admin never types it.
  number: z.number().int().min(1).optional(),
  title: z.string().trim().min(1, 'Stop title is required'),
  subtitle: z.string().trim(),
  timelineArea: z.string().trim(),
  duration: z.string().trim(),
  description: z.string().trim(),
  address: z.string().trim(),
  lat: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  lng: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  mapsUrl: z.string().trim(),
})

const itineraryStopsSchema = z
  .array(itineraryStopSchema)
  .min(1, 'Add at least one itinerary stop')
  .superRefine((stops, ctx) => {
    const ids = new Set(stops.map((stop) => stop.id))
    if (ids.size !== stops.length) {
      ctx.addIssue({ code: 'custom', message: 'Each stop needs a unique id' })
    }

    // The map centres on the meeting point and the timeline stops before the
    // end marker, so more than one of either has no defined rendering.
    for (const kind of ['meeting', 'end'] as const) {
      if (stops.filter((stop) => stop.kind === kind).length > 1) {
        ctx.addIssue({ code: 'custom', message: `Only one stop can be the ${kind} point` })
      }
    }
  })

/** The desktop hero collage has one feature slot plus four tiles. */
export const MIN_BANNER_PHOTOS = 5

const tourBannerPhotoSchema = z.object({
  id: z.string().trim().min(1),
  url: pendingImageUrlSchema,
  alt_text: z.string().trim().min(1, 'Alt text is required'),
  label: z.string().trim().min(1, 'Label is required'),
  featured: z.boolean(),
})

const bannerPhotosSchema = z
  .array(tourBannerPhotoSchema)
  .min(MIN_BANNER_PHOTOS, `Add at least ${MIN_BANNER_PHOTOS} banner images`)
  .superRefine((photos, ctx) => {
    const featured = photos.filter((photo) => photo.featured)

    if (featured.length !== 1) {
      ctx.addIssue({
        code: 'custom',
        message:
          featured.length === 0
            ? 'Choose a feature image'
            : 'Only one photo can be the feature image',
      })
    }

    const ids = new Set(photos.map((photo) => photo.id))
    if (ids.size !== photos.length) {
      ctx.addIssue({ code: 'custom', message: 'Each banner image needs a unique id' })
    }
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
  bannerPhotos: bannerPhotosSchema,
  itineraryStops: itineraryStopsSchema,
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
