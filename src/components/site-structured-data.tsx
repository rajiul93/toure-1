import {
  buildSiteStructuredGraph,
  renderJsonLd,
} from '@/lib/structured-data-builders'
import { loadPublicConfigWithFallback } from '@/lib/public-config'
import { getSiteSeoFromDB } from '@/lib/services/site-seo.service'

/** Site-wide Organization + WebSite JSON-LD (every page). */
export default async function SiteStructuredData() {
  const [{ siteConfig, tourConfig }, seoResult] = await Promise.all([
    loadPublicConfigWithFallback(),
    getSiteSeoFromDB().catch(() => null),
  ])

  if (!seoResult) return null

  const graph = buildSiteStructuredGraph({
    site: siteConfig,
    seo: seoResult,
    shortDescription: tourConfig.louvreTour.shortDescription,
  })

  return renderJsonLd(graph)
}
