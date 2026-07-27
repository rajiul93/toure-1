import {
  buildHomeStructuredGraph,
  renderJsonLd,
} from '@/lib/structured-data-builders'
import { loadPublicConfigWithFallback } from '@/lib/public-config'
import { getSiteSeoFromDB } from '@/lib/services/site-seo.service'

/** Home-only Product / FAQ / TouristTrip JSON-LD. */
export default async function HomeStructuredData() {
  const [{ siteConfig, tourConfig }, seoResult] = await Promise.all([
    loadPublicConfigWithFallback(),
    getSiteSeoFromDB().catch(() => null),
  ])

  if (!seoResult) return null

  const graph = buildHomeStructuredGraph({
    site: siteConfig,
    tourConfig,
  })

  return renderJsonLd(graph)
}
