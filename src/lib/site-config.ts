/** Company, contact, booking integration, and site-wide copy (client-safe). */

import { getDefaultSiteSettingsInput } from '@/lib/site-config.defaults'
import { resolveSiteConfig } from '@/lib/site-config.merge'

const DEV_FALLBACK_SITE_URL = 'http://localhost:3000'

/**
 * Resolves the public site origin used for canonicals, `metadataBase`,
 * `sitemap.xml` and `robots.txt`.
 *
 * Silently defaulting to localhost in production would publish localhost
 * canonicals and effectively de-index the site, so that case throws instead.
 *
 * Pure (takes its inputs) so it can be unit-tested; `getSiteUrl` reads
 * `process.env.NEXT_PUBLIC_SITE_URL` as a literal so Next can still inline it
 * into client bundles.
 */
export function resolveSiteUrl(
  rawUrl: string | undefined,
  nodeEnv: string | undefined,
): string {
  const isProduction = nodeEnv === 'production'
  const url = rawUrl?.trim()

  if (!url) {
    if (isProduction) {
      throw new Error(
        '[site-config] NEXT_PUBLIC_SITE_URL is required in production. ' +
          'Without it every canonical URL and sitemap entry would point at localhost.',
      )
    }
    return DEV_FALLBACK_SITE_URL
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error(
      `[site-config] NEXT_PUBLIC_SITE_URL must be an absolute URL (got "${url}").`,
    )
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error(
      `[site-config] NEXT_PUBLIC_SITE_URL must be http(s) (got "${parsed.protocol}").`,
    )
  }

  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
  if (isProduction && isLocal) {
    // Loud, but not fatal: a production build against localhost is legitimate
    // when smoke-testing locally.
    console.warn(
      '[site-config] NEXT_PUBLIC_SITE_URL points at localhost in a production ' +
        'build. Canonicals and sitemap.xml will be wrong if this is deployed.',
    )
  }

  return url.replace(/\/$/, '')
}

export function getSiteUrl(): string {
  return resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, process.env.NODE_ENV)
}

const defaultInput = getDefaultSiteSettingsInput()
export const SITE = resolveSiteConfig(defaultInput)

export function getDefaultSiteConfig() {
  return resolveSiteConfig(getDefaultSiteSettingsInput())
}
