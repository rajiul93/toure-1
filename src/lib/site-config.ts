/** Company, contact, booking integration, and site-wide copy (client-safe). */

import { getDefaultSiteSettingsInput } from '@/lib/site-config.defaults'
import { resolveSiteConfig } from '@/lib/site-config.merge'

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL
  if (url) return url.replace(/\/$/, '')
  return 'http://localhost:3000'
}

const defaultInput = getDefaultSiteSettingsInput()
export const SITE = resolveSiteConfig(defaultInput)

export function getDefaultSiteConfig() {
  return resolveSiteConfig(getDefaultSiteSettingsInput())
}
