import { revalidatePath } from 'next/cache'

/** Invalidate public blog pages after admin mutations. */
export function revalidateBlogPaths(options?: { slug?: string; previousSlug?: string }) {
  revalidatePath('/blog')

  if (options?.slug) {
    revalidatePath(`/blog/${options.slug}`)
  }

  if (options?.previousSlug && options.previousSlug !== options.slug) {
    revalidatePath(`/blog/${options.previousSlug}`)
  }

  revalidatePath('/sitemap.xml')
}
