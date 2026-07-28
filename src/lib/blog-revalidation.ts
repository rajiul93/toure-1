import { revalidatePath, revalidateTag } from 'next/cache'

export const BLOG_POSTS_TAG = 'blog-posts'

/**
 * Must be used by BOTH the `unstable_cache` definitions that read blogs and the
 * `revalidateTag` calls below — a tag that nothing declares silently no-ops.
 */
export function blogSlugTag(slug: string) {
  return `blog-${slug}`
}

/** Invalidate public blog pages after admin mutations. */
export function revalidateBlogPaths(options?: { slug?: string; previousSlug?: string }) {
  revalidateTag(BLOG_POSTS_TAG, { expire: 0 })
  revalidatePath('/blog', 'page')

  if (options?.slug) {
    revalidateTag(blogSlugTag(options.slug), { expire: 0 })
    revalidatePath(`/blog/${options.slug}`, 'page')
  }

  if (options?.previousSlug && options.previousSlug !== options.slug) {
    revalidateTag(blogSlugTag(options.previousSlug), { expire: 0 })
    revalidatePath(`/blog/${options.previousSlug}`, 'page')
  }

  revalidatePath('/sitemap.xml')
}
