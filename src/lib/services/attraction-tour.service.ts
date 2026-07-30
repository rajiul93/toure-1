import { toBannerPhotos } from '@/lib/attraction-tour-mapper'
import { sanitizeBlogHtml } from '@/lib/blog-article-html'
import { prisma } from '@/lib/db'
import type {
  AttractionTourFormValues,
  TourGalleryPhotoValues,
  TourImportantInfoValues,
} from '@/lib/validations/attraction-tour.validation'
import type { Prisma } from '../../../generated/prisma/client'

export type AdminAttractionTourListItem = {
  id: string
  slug: string
  title: string
  isPublished: boolean
  priceFrom: string
  ratingAverage: number
  reviewCount: number
  updatedAt: string
  /** Feature image, for the list thumbnail. Empty when no gallery is set yet. */
  imageUrl: string
  imageAlt: string
  /**
   * False means the tour falls back to the site-wide Bokun widget, so visitors
   * would book a different experience. Surfaced in the list so the gap is
   * visible without opening each tour.
   */
  hasBokunTarget: boolean
}

/** JSON columns come back as `unknown`; parse defensively. */
function parseJsonArray<T>(value: Prisma.JsonValue | null): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

/**
 * The four Quill-authored fields are written by an admin and rendered with
 * `dangerouslySetInnerHTML` on a public page, so this is the boundary that
 * prevents stored XSS. It lives in the service rather than the route handlers
 * so create and update can never diverge.
 */
function mapFormToColumns(values: AttractionTourFormValues) {
  return {
    slug: values.slug,
    title: values.title,
    isPublished: values.isPublished,
    ratingAverage: values.rating.average,
    reviewCount: values.rating.reviewCount,
    priceFrom: values.bookingPanel.priceFrom,
    priceNote: values.bookingPanel.priceNote,
    primaryCta: values.bookingPanel.primaryCta,
    secondaryOptions: values.bookingPanel.secondaryOptions,
    overviewDescription: sanitizeBlogHtml(values.overview.description),
    highlightsHtml: sanitizeBlogHtml(values.overview.highlightsHtml),
    lovedTags: values.whyTravelersLoved.tags,
    lovedQuotes: values.whyTravelersLoved.quotes,
    meetingPointAddress: sanitizeBlogHtml(values.meetingPointAddress),
    questionsDescription: values.questionsSection.description,
    questionsCtaLabel: values.questionsSection.ctaLabel,
    questionsCtaHref: values.questionsSection.ctaHref,
    galleryPhotos: values.gallery as unknown as Prisma.InputJsonValue,
    importantInfo: values.importantInformation.map((section) => ({
      ...section,
      html: sanitizeBlogHtml(section.html),
    })) as unknown as Prisma.InputJsonValue,
    travelerPhotos: values.travelerPhotos as unknown as Prisma.InputJsonValue,
    metaTitle: values.seo.metaTitle,
    metaDescription: values.seo.metaDescription,
    metaKeywords: values.seo.metaKeywords,
    ogImageUrl: values.seo.ogImage.url,
    ogImageAlt: values.seo.ogImage.alt,
    bokunChannel: values.bokun.channel,
    bokunExperienceId: values.bokun.experienceId,
  }
}

function mapReviewsToCreate(values: AttractionTourFormValues) {
  return values.reviews.map((review, index) => ({
    reviewer: review.reviewer,
    reviewDate: review.date,
    rating: Math.round(review.rating),
    text: review.text,
    sortOrder: index,
  }))
}

type TourWithReviews = Prisma.AttractionTourGetPayload<{ include: { reviews: true } }>

/** DB row → the shape the admin form binds to. */
export function mapTourRecordToForm(tour: TourWithReviews): AttractionTourFormValues {
  return {
    title: tour.title,
    slug: tour.slug,
    isPublished: tour.isPublished,
    rating: { average: tour.ratingAverage, reviewCount: tour.reviewCount },
    gallery: parseJsonArray<TourGalleryPhotoValues>(tour.galleryPhotos),
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
    importantInformation: parseJsonArray<TourImportantInfoValues>(tour.importantInfo),
    meetingPointAddress: tour.meetingPointAddress,
    questionsSection: {
      description: tour.questionsDescription,
      ctaLabel: tour.questionsCtaLabel,
      ctaHref: tour.questionsCtaHref,
    },
    travelerPhotos: parseJsonArray<{ url: string; alt: string }>(tour.travelerPhotos),
    reviews: [...tour.reviews]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((review) => ({
        id: review.id,
        reviewer: review.reviewer,
        date: review.reviewDate,
        rating: review.rating,
        text: review.text,
      })),
    seo: {
      metaTitle: tour.metaTitle,
      metaDescription: tour.metaDescription,
      metaKeywords: tour.metaKeywords,
      ogImage: { url: tour.ogImageUrl, alt: tour.ogImageAlt },
    },
    bokun: {
      channel: tour.bokunChannel,
      experienceId: tour.bokunExperienceId,
    },
  }
}

export async function listAdminAttractionToursFromDB(params: {
  page?: number
  limit?: number
  search?: string
}) {
  const page = params.page ?? 1
  const limit = params.limit ?? 20
  const search = params.search?.trim()

  const where: Prisma.AttractionTourWhereInput = {
    isDeleted: false,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.attractionTour.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        isPublished: true,
        priceFrom: true,
        ratingAverage: true,
        reviewCount: true,
        updatedAt: true,
        galleryPhotos: true,
        bokunChannel: true,
        bokunExperienceId: true,
      },
    }),
    prisma.attractionTour.count({ where }),
  ])

  return {
    items: items.map(({ galleryPhotos, bokunChannel, bokunExperienceId, ...item }) => {
      const feature = toBannerPhotos(parseJsonArray<TourGalleryPhotoValues>(galleryPhotos))[0]

      return {
        ...item,
        updatedAt: item.updatedAt.toISOString(),
        imageUrl: feature?.src ?? '',
        imageAlt: feature?.alt ?? '',
        hasBokunTarget: Boolean(bokunChannel && bokunExperienceId),
      }
    }) satisfies AdminAttractionTourListItem[],
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}

export async function getAttractionTourFromDB(id: string) {
  const tour = await prisma.attractionTour.findFirst({
    where: { id, isDeleted: false },
    include: { reviews: true },
  })

  return tour ? mapTourRecordToForm(tour) : null
}

export async function createAttractionTourInDB(values: AttractionTourFormValues) {
  const existing = await prisma.attractionTour.findUnique({
    where: { slug: values.slug },
    select: { id: true },
  })

  if (existing) {
    throw new Error(`A tour with the slug "${values.slug}" already exists`)
  }

  const tour = await prisma.attractionTour.create({
    data: {
      ...mapFormToColumns(values),
      reviews: { create: mapReviewsToCreate(values) },
    },
    include: { reviews: true },
  })

  return { id: tour.id, slug: tour.slug, form: mapTourRecordToForm(tour) }
}

export async function updateAttractionTourInDB(
  id: string,
  values: AttractionTourFormValues,
) {
  const clash = await prisma.attractionTour.findFirst({
    where: { slug: values.slug, NOT: { id } },
    select: { id: true },
  })

  if (clash) {
    throw new Error(`A tour with the slug "${values.slug}" already exists`)
  }

  const tour = await prisma.$transaction(async (tx) => {
    // Reviews are fully replaced: they are ordered and edited as one list, so
    // diffing individual rows would add complexity without benefit.
    await tx.attractionTourReview.deleteMany({ where: { tourId: id } })

    return tx.attractionTour.update({
      where: { id },
      data: {
        ...mapFormToColumns(values),
        reviews: { create: mapReviewsToCreate(values) },
      },
      include: { reviews: true },
    })
  })

  return { id: tour.id, slug: tour.slug, form: mapTourRecordToForm(tour) }
}

/** Existence check for routes that must 404 before mutating. */
export async function attractionTourExistsInDB(id: string): Promise<boolean> {
  const tour = await prisma.attractionTour.findFirst({
    where: { id, isDeleted: false },
    select: { id: true },
  })

  return tour !== null
}

/**
 * Publish toggle from the list page. Deliberately separate from the full update
 * so flipping a switch never has to round-trip (and re-sanitize) the whole tour.
 */
export async function setAttractionTourPublishedInDB(id: string, isPublished: boolean) {
  const tour = await prisma.attractionTour.update({
    where: { id },
    data: { isPublished },
    select: { id: true, slug: true, isPublished: true },
  })

  return tour
}

export async function softDeleteAttractionTourInDB(id: string) {
  await prisma.attractionTour.update({
    where: { id },
    data: { isDeleted: true, isPublished: false },
  })
}
