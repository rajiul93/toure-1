/**
 * DB row → public page payload. Kept free of any runtime Prisma import (the
 * `Prisma` import below is type-only, so it erases) which keeps it unit-testable
 * without a database connection.
 */

import {
  buildGalleryPhotos,
  type AttractionTourCard,
  type AttractionTourDetail,
  type AttractionTourInfoSection,
} from '@/lib/attraction-tour-detail'
import type { BannerPhoto } from '@/lib/tour-config.types'
import { isEmptyRichText } from '@/lib/validations/attraction-tour.validation'
import type {
  TourGalleryPhotoValues,
  TourImportantInfoValues,
} from '@/lib/validations/attraction-tour.validation'
import type { Prisma } from '../../generated/prisma/client'

/** The hero collage has exactly five slots (one feature + four tiles). */
const HERO_PHOTO_COUNT = 5

export type AttractionTourWithReviews = Prisma.AttractionTourGetPayload<{
  include: { reviews: true }
}>

/** JSON columns come back as `unknown`; parse defensively. */
function parseJsonArray<T>(value: Prisma.JsonValue | null): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

/**
 * Admin photos carry `url`; the public renderer expects `src`. Feature-first so
 * the designated feature image always lands in the large hero slot, matching
 * how the home banner orders its photos.
 */
export function toBannerPhotos(photos: TourGalleryPhotoValues[]): BannerPhoto[] {
  const usable = photos.filter((photo) => photo.url.trim() !== '')
  const featured = usable.filter((photo) => photo.featured)
  const rest = usable.filter((photo) => !photo.featured)

  return [...featured, ...rest].map((photo, index) => ({
    src: photo.url,
    alt: photo.alt,
    label: photo.label,
    featured: index === 0,
  }))
}

function toImportantInfo(sections: TourImportantInfoValues[]): AttractionTourInfoSection[] {
  return sections
    .map((section) => ({
      id: section.id,
      title: section.title,
      html: section.html ?? '',
    }))
    .filter((section) => !isEmptyRichText(section.html))
}

const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&ldquo;': '“',
  '&rdquo;': '”',
}

/**
 * Listing cards show the overview as plain text. The overview is Quill HTML, so
 * without this the card would print literal `<p>` and `<strong>` tags. Block
 * boundaries become spaces so words from adjacent paragraphs don't run together.
 */
export function htmlToExcerpt(html: string, maxLength = 180): string {
  if (!html) return ''

  const text = html
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&[a-z]+;/gi, (entity) => HTML_ENTITIES[entity.toLowerCase()] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxLength) return text

  // Cut on a word boundary so the ellipsis doesn't land mid-word.
  const clipped = text.slice(0, maxLength)
  const lastSpace = clipped.lastIndexOf(' ')
  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).replace(/[.,;:—-]$/, '')}…`
}

export function mapTourRecordToCard(tour: {
  slug: string
  title: string
  priceFrom: string
  ratingAverage: number
  reviewCount: number
  galleryPhotos: Prisma.JsonValue | null
}): AttractionTourCard {
  const photos = toBannerPhotos(parseJsonArray<TourGalleryPhotoValues>(tour.galleryPhotos))

  return {
    slug: tour.slug,
    title: tour.title,
    imageUrl: photos[0]?.src ?? '',
    rating: tour.ratingAverage,
    reviewCount: tour.reviewCount,
    priceFrom: tour.priceFrom,
    href: `/attraction-tours/${tour.slug}`,
  }
}

/** DB row → the exact payload `AttractionTourDetailView` already renders. */
/**
 * SEO fields are optional in the dashboard, so fill each blank from the tour's
 * own content. Doing it here means `generateMetadata` and any structured data
 * read one already-resolved shape instead of repeating the fallback chain.
 */
export function buildAttractionTourSeo(
  tour: Pick<
    AttractionTourWithReviews,
    'title' | 'metaTitle' | 'metaDescription' | 'metaKeywords' | 'ogImageUrl' | 'ogImageAlt' | 'overviewDescription'
  >,
  featurePhoto?: BannerPhoto,
): AttractionTourDetail['seo'] {
  return {
    metaTitle: tour.metaTitle.trim() || tour.title,
    metaDescription:
      tour.metaDescription.trim() || htmlToExcerpt(tour.overviewDescription, 160),
    metaKeywords: tour.metaKeywords.filter((keyword) => keyword.trim() !== ''),
    ogImage: {
      url: tour.ogImageUrl.trim() || featurePhoto?.src || '',
      alt: tour.ogImageAlt.trim() || featurePhoto?.alt || tour.title,
    },
  }
}

export function mapTourRecordToDetail(tour: AttractionTourWithReviews): AttractionTourDetail {
  const configured = toBannerPhotos(parseJsonArray<TourGalleryPhotoValues>(tour.galleryPhotos))
  const galleryPhotos = buildGalleryPhotos(configured)
  const bannerPhotos = galleryPhotos.slice(0, HERO_PHOTO_COUNT)

  const travelerPhotos = parseJsonArray<{ url: string; alt: string }>(tour.travelerPhotos).filter(
    (photo) => photo.url.trim() !== '',
  )

  return {
    slug: tour.slug,
    breadcrumb: [
      { label: 'Home', url: '/' },
      { label: 'France', url: '/attraction-tours' },
      { label: 'Paris', url: '/attraction-tours' },
      { label: tour.title, url: null },
    ],
    title: tour.title,
    rating: { average: tour.ratingAverage, reviewCount: tour.reviewCount },
    seo: buildAttractionTourSeo(tour, bannerPhotos[0]),
    bokun: { channel: tour.bokunChannel, experienceId: tour.bokunExperienceId },
    gallery: { bannerPhotos, galleryPhotos },
    bookingPanel: {
      priceFrom: tour.priceFrom,
      priceNote: tour.priceNote,
      primaryCta: tour.primaryCta,
      secondaryOptions: tour.secondaryOptions,
    },
    whyTravelersLoved: { tags: tour.lovedTags, quotes: tour.lovedQuotes },
    overview: {
      description: tour.overviewDescription,
      highlightsHtml: tour.highlightsHtml,
    },
    importantInformation: toImportantInfo(
      parseJsonArray<TourImportantInfoValues>(tour.importantInfo),
    ),
    meetingPointAddress: tour.meetingPointAddress,
    questionsSection: {
      description: tour.questionsDescription,
      ctaLabel: tour.questionsCtaLabel,
      ctaHref: tour.questionsCtaHref,
    },
    // Fall back to hero photos so the section is never a row of empty frames.
    travelerPhotos:
      travelerPhotos.length > 0
        ? travelerPhotos
        : bannerPhotos.slice(0, 4).map((photo) => ({ url: photo.src, alt: photo.alt })),
    reviews: {
      list: [...tour.reviews]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((review) => ({
          reviewer: review.reviewer,
          date: review.reviewDate,
          rating: review.rating,
          text: review.text,
        })),
      showMoreLabel: 'Show more reviews',
      showMoreHref: '/reviews',
    },
    alsoBought: [mapTourRecordToCard(tour)],
  }
}
