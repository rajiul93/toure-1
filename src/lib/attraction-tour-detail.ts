import type { BannerPhoto } from '@/lib/tour-config.types'

export type AttractionTourBreadcrumb = {
  label: string
  url: string | null
}

export type AttractionTourCard = {
  slug: string
  title: string
  imageUrl: string
  rating: number
  reviewCount: number
  priceFrom: string
  href: string
}

export type AttractionTourReview = {
  reviewer: string
  date: string
  rating: number
  text: string
}

/**
 * Keeps the section identity the layout depends on (`inclusion`/`exclusion` are
 * placed side by side and get their own bullet icons) while the body itself is
 * free-form Quill HTML. Distinct from the home page's `TourImportantInfoSection`,
 * which is still an item list edited in tour-config.
 */
export type AttractionTourInfoSection = {
  id: string
  title: string
  html: string
}

/** Static detail payload — only fields rendered on `/attraction-tours/[slug]`. */
export type AttractionTourDetail = {
  slug: string
  breadcrumb: AttractionTourBreadcrumb[]
  title: string
  rating: {
    average: number
    reviewCount: number
  }
  gallery: {
    bannerPhotos: BannerPhoto[]
    galleryPhotos: BannerPhoto[]
  }
  bookingPanel: {
    priceFrom: string
    priceNote: string
    primaryCta: string
    secondaryOptions: string[]
  }
  whyTravelersLoved: {
    tags: string[]
    quotes: string[]
  }
  /** Quill-authored HTML, already sanitized. Rendered as rich text. */
  overview: {
    description: string
    highlightsHtml: string
  }
  importantInformation: AttractionTourInfoSection[]
  /** Quill-authored HTML, already sanitized. */
  meetingPointAddress: string
  questionsSection: {
    description: string
    ctaLabel: string
    ctaHref: string
  }
  travelerPhotos: Array<{ url: string; alt: string }>
  reviews: {
    list: AttractionTourReview[]
    showMoreLabel: string
    showMoreHref: string
  }
  alsoBought: AttractionTourCard[]
}

/** Photos the full-screen gallery should offer, regardless of how few are configured. */
export const MIN_GALLERY_PHOTOS = 15

/**
 * Pads the configured photos out to `MIN_GALLERY_PHOTOS` by cycling through
 * them, so the gallery always has a full set to browse. Labels get a numeric
 * suffix on repeats so each entry is still distinguishable.
 */
export function buildGalleryPhotos(
  photos: BannerPhoto[],
  minimum = MIN_GALLERY_PHOTOS,
): BannerPhoto[] {
  if (photos.length === 0) return []

  const gallery: BannerPhoto[] = []
  const target = Math.max(minimum, photos.length)

  for (let index = 0; index < target; index += 1) {
    const source = photos[index % photos.length]
    const pass = Math.floor(index / photos.length)

    gallery.push({
      ...source,
      featured: index === 0,
      label: pass === 0 ? source.label : `${source.label} ${pass + 1}`,
    })
  }

  return gallery
}
