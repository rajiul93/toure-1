/** Louvre tour content defaults (client-safe). */

import { getDefaultTourSettingsInput } from '@/lib/tour-config.defaults'
import { resolveTourConfig } from '@/lib/tour-config.merge'

export { getSiteUrl } from '@/lib/site-config'

const defaultConfig = resolveTourConfig(getDefaultTourSettingsInput())

export const LOUVRE_TOUR = defaultConfig.louvreTour
export const TOUR_FAQ = defaultConfig.faqs
export const TOUR_IMPORTANT_INFO = defaultConfig.importantInfo
export const BANNER_PHOTOS = defaultConfig.bannerPhotos

export type { TourFaqItem } from '@/lib/tour-config.types'

export function getDefaultTourConfig() {
  return resolveTourConfig(getDefaultTourSettingsInput())
}

export function getAttractionTours(config = getDefaultTourConfig()) {
  const tour = config.louvreTour

  return [
    {
      slug: tour.slug,
      title: tour.name.replace(' — Timed Entry', ''),
      excerpt: tour.description,
      image: tour.ogImage,
      priceLabel: tour.priceLabel,
      durationLabel: tour.durationLabel,
      rating: tour.rating,
      href: `/attraction-tours/${tour.slug}`,
    },
  ]
}
