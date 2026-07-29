import { revalidatePath, revalidateTag } from 'next/cache'

export const ATTRACTION_TOURS_TAG = 'attraction-tours'

/**
 * Must be used by BOTH the `unstable_cache` reads and the `revalidateTag` calls
 * below — a tag nothing declares silently no-ops.
 */
export function attractionTourSlugTag(slug: string) {
  return `attraction-tour-${slug}`
}

/** Invalidate public attraction-tour pages after an admin mutation. */
export function revalidateAttractionTourPaths(options?: {
  slug?: string
  previousSlug?: string
}) {
  revalidateTag(ATTRACTION_TOURS_TAG, { expire: 0 })
  revalidatePath('/attraction-tours')

  if (options?.slug) {
    revalidateTag(attractionTourSlugTag(options.slug), { expire: 0 })
    revalidatePath(`/attraction-tours/${options.slug}`)
  }

  if (options?.previousSlug && options.previousSlug !== options.slug) {
    revalidateTag(attractionTourSlugTag(options.previousSlug), { expire: 0 })
    revalidatePath(`/attraction-tours/${options.previousSlug}`)
  }

  revalidatePath('/sitemap.xml')
}
