import type {
  AttractionTourCard,
  AttractionTourDetail,
} from '@/lib/attraction-tour-detail'
import {
  htmlToExcerpt,
  mapTourRecordToCard,
  mapTourRecordToDetail,
} from '@/lib/attraction-tour-mapper'
import {
  ATTRACTION_TOURS_TAG,
  attractionTourSlugTag,
} from '@/lib/attraction-tour-revalidation'
import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'

/**
 * Admin mutations call `revalidateTag`, so edits show up immediately. The time
 * window is a safety net, not the refresh mechanism: a tag-only entry lives
 * forever, so if the cache ever captures an empty or failed read — a build that
 * ran before any tour was published, or a transient DB error — the page stays
 * wrong until someone happens to save in the dashboard. Bounding it means the
 * worst case self-heals.
 */
const CACHE_REVALIDATE_SECONDS = 300

const readPublishedTour = (slug: string) =>
  unstable_cache(
    async () => {
      const tour = await prisma.attractionTour.findFirst({
        where: { slug, isPublished: true, isDeleted: false },
        include: { reviews: true },
      })

      return tour ? mapTourRecordToDetail(tour) : null
    },
    ['attraction-tour-detail', slug],
    {
      tags: [ATTRACTION_TOURS_TAG, attractionTourSlugTag(slug)],
      revalidate: CACHE_REVALIDATE_SECONDS,
    },
  )()

/** A listing card carries the excerpt the index page shows under the title. */
export type AttractionTourListingCard = AttractionTourCard & { excerpt: string }

const readPublishedTours = unstable_cache(
  async () => {
    const tours = await prisma.attractionTour.findMany({
      where: { isPublished: true, isDeleted: false },
      orderBy: { updatedAt: 'desc' },
      select: {
        slug: true,
        title: true,
        priceFrom: true,
        ratingAverage: true,
        reviewCount: true,
        galleryPhotos: true,
        overviewDescription: true,
      },
    })

    return tours.map((tour) => ({
      ...mapTourRecordToCard(tour),
      excerpt: htmlToExcerpt(tour.overviewDescription),
    })) satisfies AttractionTourListingCard[]
  },
  ['attraction-tour-cards'],
  { tags: [ATTRACTION_TOURS_TAG], revalidate: CACHE_REVALIDATE_SECONDS },
)

/**
 * Every attraction tour is a database row now — there is no hand-built
 * fallback. A read failure returns null so the page 404s rather than rendering
 * a half-empty tour.
 */
export const resolveAttractionTourDetail = cache(
  async (slug: string): Promise<AttractionTourDetail | null> => {
    try {
      return await readPublishedTour(slug)
    } catch (error) {
      console.error(`[attraction-tours] failed to load "${slug}" from the database`, error)
      return null
    }
  },
)

export const resolvePublishedAttractionTourCards = cache(
  async (): Promise<AttractionTourListingCard[]> => {
    try {
      return await readPublishedTours()
    } catch (error) {
      console.error('[attraction-tours] failed to list published tours', error)
      return []
    }
  },
)

export async function resolveAttractionTourSlugs(): Promise<string[]> {
  const cards = await resolvePublishedAttractionTourCards()
  return cards.map((card) => card.slug)
}
