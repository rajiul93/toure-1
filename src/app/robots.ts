import { getSiteSeoFromDB } from '@/lib/services/site-seo.service'
import { getSiteUrl } from '@/lib/site-config'
import type { MetadataRoute } from 'next'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const [seo] = await Promise.all([getSiteSeoFromDB()])
  const siteUrl = getSiteUrl()

  const rules: MetadataRoute.Robots['rules'] = [
    {
      userAgent: '*',
      allow: '/',
      disallow: seo.crawlers.disallowPaths,
    },
  ]

  if (seo.crawlers.allowAiBots) {
    rules.push(
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
    )
  }

  return {
    rules,
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
