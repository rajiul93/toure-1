import { prisma } from '@/lib/db'
import { getDefaultSiteSettingsInput } from '@/lib/site-config.defaults'
import { mergeSiteSettingsInput, parseSiteSettingsJson, resolveSiteConfig } from '@/lib/site-config.merge'
import type { SiteSettingsInput } from '@/lib/site-config.types'
import type { SiteSettingsFormValues } from '@/lib/validations/site-settings.validation'
import { unstable_cache } from 'next/cache'

const SITE_SETTINGS_ID = 'default'

async function loadSiteConfigFromDB() {
  const row = await prisma.siteSettings.findUnique({
    where: { id: SITE_SETTINGS_ID },
  })

  const input = row ? parseSiteSettingsJson(row.data) : getDefaultSiteSettingsInput()
  return resolveSiteConfig(input)
}

/**
 * A tag-only cache that captures an empty/wrong value (fresh DB with no row
 * yet, or a shape change after a deploy) never self-heals without a time
 * bound. Versioning the key ensures a deploy always gets a fresh read on
 * boot; the tag lets admin saves invalidate it immediately. The time window
 * is a safety net, not the refresh mechanism.
 */
export const getSiteConfigFromDB = unstable_cache(
  loadSiteConfigFromDB,
  ['site-config-v1'],
  { tags: ['site-config'], revalidate: 300 },
)

export async function getSiteSettingsFormFromDB(): Promise<SiteSettingsFormValues> {
  const row = await prisma.siteSettings.findUnique({
    where: { id: SITE_SETTINGS_ID },
  })

  if (!row) {
    return getDefaultSiteSettingsInput()
  }

  return parseSiteSettingsJson(row.data)
}

export async function saveSiteSettingsToDB(
  values: SiteSettingsFormValues,
  updatedBy?: string,
) {
  const merged = mergeSiteSettingsInput(values)

  await prisma.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    create: {
      id: SITE_SETTINGS_ID,
      data: merged as SiteSettingsInput,
      updatedBy: updatedBy ?? null,
    },
    update: {
      data: merged as SiteSettingsInput,
      updatedBy: updatedBy ?? null,
    },
  })

  return resolveSiteConfig(merged)
}
