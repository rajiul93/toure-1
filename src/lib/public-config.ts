import { getDefaultSiteConfig } from '@/lib/site-config'
import { getDefaultTourConfig } from '@/lib/tour-config'
import { getSiteConfigFromDB } from '@/lib/services/site-settings.service'
import { getTourConfigFromDB } from '@/lib/services/tour-settings.service'

/**
 * Loads the site/tour config that every public page depends on.
 *
 * These two reads gate the whole public layout, so a database hiccup used to
 * take the entire site down with an unbranded error page — even though a
 * complete set of defaults already exists. Each read degrades independently.
 */
export async function loadPublicConfigWithFallback() {
  const [site, tour] = await Promise.allSettled([
    getSiteConfigFromDB(),
    getTourConfigFromDB(),
  ])

  if (site.status === 'rejected') {
    console.error('[public-layout] site config unavailable, using defaults', site.reason)
  }
  if (tour.status === 'rejected') {
    console.error('[public-layout] tour config unavailable, using defaults', tour.reason)
  }

  return {
    siteConfig: site.status === 'fulfilled' ? site.value : getDefaultSiteConfig(),
    tourConfig: tour.status === 'fulfilled' ? tour.value : getDefaultTourConfig(),
    degraded: site.status === 'rejected' || tour.status === 'rejected',
  }
}
