export const TOUR_PATH_PREFIX = '/attraction-tours/'

/**
 * The tour a visitor is currently looking at, or null anywhere else.
 * Shared so the booking sidebar and the chat widget can never disagree about
 * which tour a URL refers to.
 */
export function tourSlugFromPath(pathname: string): string | null {
  if (!pathname.startsWith(TOUR_PATH_PREFIX)) return null
  return pathname.slice(TOUR_PATH_PREFIX.length).split('/')[0] || null
}
