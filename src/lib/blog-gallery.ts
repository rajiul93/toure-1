export type BlogGalleryImage = {
  id: string
  url: string
  alt_text: string
}

function isGalleryImage(value: unknown): value is BlogGalleryImage {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.url === 'string' &&
    typeof item.alt_text === 'string'
  )
}

/** Parse `Blog.galleryImages` JSON from the database into form-safe items. */
export function parseBlogGalleryImages(value: unknown): BlogGalleryImage[] {
  if (!Array.isArray(value)) return []

  return value.filter(isGalleryImage).map((item) => ({
    id: item.id,
    url: item.url.trim(),
    alt_text: item.alt_text.trim(),
  }))
}

export function serializeBlogGalleryImages(items: BlogGalleryImage[]): BlogGalleryImage[] {
  return items
    .filter((item) => item.url.trim())
    .map((item) => ({
      id: item.id,
      url: item.url.trim(),
      alt_text: item.alt_text.trim(),
    }))
}

export function galleryFieldKey(id: string) {
  return `gallery_${id}`
}

const FEATURED_GALLERY_ID = '__featured__'

/** Featured image first, then gallery items in admin order. */
export function buildPublicBlogGalleryImages(
  featured: { url: string; alt_text: string },
  gallery: BlogGalleryImage[],
): BlogGalleryImage[] {
  const orderedGallery = gallery.filter((item) => item.url.trim())
  const featuredUrl = featured.url.trim()

  const featuredEntry: BlogGalleryImage | null = featuredUrl
    ? {
        id: FEATURED_GALLERY_ID,
        url: featuredUrl,
        alt_text: featured.alt_text.trim() || 'Featured image',
      }
    : null

  if (orderedGallery.length === 0) {
    return featuredEntry ? [featuredEntry] : []
  }

  if (!featuredEntry) return orderedGallery

  const rest = orderedGallery.filter((item) => item.url !== featuredUrl)
  return [featuredEntry, ...rest]
}
