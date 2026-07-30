import { z } from 'zod'

/**
 * Mirrors the sections rendered by `/attraction-tours/[slug]`
 * (`AttractionTourDetailView`). Field names follow the page structure so the
 * admin form reads like the page it produces.
 */

const imageUrlSchema = z
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

/** Hero collage needs one feature plus four tiles. */
export const MIN_TOUR_GALLERY_PHOTOS = 5

export const tourGalleryPhotoSchema = z.object({
  id: z.string().trim().min(1),
  url: imageUrlSchema,
  alt: z.string().trim().min(1, 'Alt text is required'),
  label: z.string().trim().min(1, 'Label is required'),
  featured: z.boolean(),
})

/**
 * Quill never emits an empty string — a cleared editor still produces
 * `<p><br></p>`. Strip tags and entities before deciding whether the author
 * actually wrote anything, otherwise "required" can be satisfied by blank
 * markup. An embedded image counts as content even with no text.
 */
export function isEmptyRichText(html: string): boolean {
  if (!html) return true
  if (/<(img|iframe|video|table)\b/i.test(html)) return false

  return (
    html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .trim() === ''
  )
}

/** A Quill-authored field that must contain something. */
function requiredRichText(message: string) {
  return z.string().refine((value) => !isEmptyRichText(value), { message })
}

export const tourImportantInfoSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1, 'Section title is required'),
  html: requiredRichText('Add content for this section'),
})

export const tourTravelerPhotoSchema = z.object({
  url: imageUrlSchema,
  alt: z.string().trim().min(1, 'Alt text is required'),
})

export const tourReviewSchema = z.object({
  id: z.string().trim().min(1),
  reviewer: z.string().trim().min(1, 'Reviewer name is required'),
  /** Display-only, e.g. "Jul 2026" — matches the existing reviews data. */
  date: z.string().trim().min(1, 'Date is required'),
  rating: z.number().min(1, 'Rating must be 1–5').max(5, 'Rating must be 1–5'),
  text: z.string().trim().min(1, 'Review text is required'),
})

export const attractionTourFormSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  slug: z
    .string()
    .trim()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens'),
  isPublished: z.boolean(),

  rating: z.object({
    average: z.number().min(0).max(5, 'Rating must be 0–5'),
    reviewCount: z.number().int().min(0, 'Review count cannot be negative'),
  }),

  gallery: z
    .array(tourGalleryPhotoSchema)
    .min(MIN_TOUR_GALLERY_PHOTOS, `Add at least ${MIN_TOUR_GALLERY_PHOTOS} gallery images`)
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
    }),

  bookingPanel: z.object({
    priceFrom: z.string().trim().min(1, 'Price is required'),
    priceNote: z.string().trim(),
    primaryCta: z.string().trim().min(1, 'Button label is required'),
    secondaryOptions: z.array(z.string().trim().min(1)),
  }),

  whyTravelersLoved: z.object({
    tags: z.array(z.string().trim().min(1)),
    quotes: z.array(z.string().trim().min(1)),
  }),

  // Rich text (Quill). Stored and rendered as sanitized HTML.
  overview: z.object({
    description: requiredRichText('Overview description is required'),
    highlightsHtml: z.string(),
  }),

  importantInformation: z.array(tourImportantInfoSchema),

  meetingPointAddress: z.string(),

  questionsSection: z.object({
    description: z.string().trim(),
    ctaLabel: z.string().trim(),
    ctaHref: z.string().trim(),
  }),

  travelerPhotos: z.array(tourTravelerPhotoSchema),

  reviews: z.array(tourReviewSchema),

  /**
   * Every field is optional. Blank values fall back to the tour's own content
   * at render time (see `buildAttractionTourSeo`), so a tour is never blocked
   * from publishing because SEO wasn't filled in.
   */
  seo: z.object({
    metaTitle: z.string().trim().max(70, 'Keep the title under 70 characters'),
    metaDescription: z
      .string()
      .trim()
      .max(200, 'Keep the description under 200 characters'),
    metaKeywords: z.array(z.string().trim().min(1)),
    ogImage: z.object({
      url: imageUrlSchema,
      alt: z.string().trim(),
    }),
  }),

  /**
   * Blank means "use the site-wide Bokun channel from /admin/site-config" —
   * the same widget the home page renders. Both fields must be set together,
   * because a channel without an experience id builds a dead calendar URL.
   */
  bokun: z
    .object({
      channel: z.string().trim(),
      experienceId: z.string().trim(),
    })
    .superRefine((value, ctx) => {
      if (Boolean(value.channel) !== Boolean(value.experienceId)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Set both the channel and the experience ID, or leave both blank',
          path: [value.channel ? 'experienceId' : 'channel'],
        })
      }
    }),
})

export type AttractionTourFormValues = z.infer<typeof attractionTourFormSchema>
export type TourGalleryPhotoValues = z.infer<typeof tourGalleryPhotoSchema>
export type TourReviewValues = z.infer<typeof tourReviewSchema>
export type TourImportantInfoValues = z.infer<typeof tourImportantInfoSchema>

/**
 * Server boundary. By the time a request lands, every `blob:` preview must have
 * been swapped for an uploaded URL — a leftover means the upload silently
 * failed and the row would store a dead link.
 */
export const attractionTourSubmissionSchema = attractionTourFormSchema.superRefine(
  (values, ctx) => {
    values.gallery.forEach((photo, index) => {
      if (photo.url.includes('blob:')) {
        ctx.addIssue({
          code: 'custom',
          message: `Gallery image ${index + 1} has not been uploaded yet.`,
          path: ['gallery', index, 'url'],
        })
      }
    })

    values.travelerPhotos.forEach((photo, index) => {
      if (photo.url.includes('blob:')) {
        ctx.addIssue({
          code: 'custom',
          message: `Traveler photo ${index + 1} has not been uploaded yet.`,
          path: ['travelerPhotos', index, 'url'],
        })
      }
    })
  },
)

export function slugifyTourTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function createEmptyAttractionTourValues(): AttractionTourFormValues {
  return {
    title: '',
    slug: '',
    isPublished: false,
    rating: { average: 4.5, reviewCount: 0 },
    gallery: [],
    bookingPanel: {
      priceFrom: '',
      priceNote: 'per person · Lowest price guarantee',
      primaryCta: 'Check availability',
      secondaryOptions: ['Reserve now & pay later'],
    },
    whyTravelersLoved: { tags: [], quotes: [] },
    overview: { description: '', highlightsHtml: '' },
    importantInformation: [
      { id: 'inclusion', title: 'Inclusion', html: '' },
      { id: 'exclusion', title: 'Exclusion', html: '' },
    ],
    meetingPointAddress: '',
    questionsSection: {
      description: '',
      ctaLabel: 'Contact us',
      ctaHref: '/about-us',
    },
    travelerPhotos: [],
    reviews: [],
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
      ogImage: { url: '', alt: '' },
    },
    bokun: { channel: '', experienceId: '' },
  }
}
