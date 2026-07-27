import { prisma } from '@/lib/db'
import { getDefaultSiteSeoSettingsInput } from '@/lib/site-seo.defaults'
import {
  mergeSiteSeoSettingsInput,
  parseSiteSeoSettingsJson,
  resolveSiteSeoConfig,
} from '@/lib/site-seo.merge'
import type { SiteSeoSettingsInput } from '@/lib/site-seo.types'
import type { SiteSeoSettingsFormValues } from '@/lib/validations/site-seo.validation'
import { unstable_cache } from 'next/cache'

const SEO_SETTINGS_ID = 'default'

async function loadSiteSeoFromDB() {
  const row = await prisma.seoSettings.findUnique({
    where: { id: SEO_SETTINGS_ID },
  })

  const input = row ? parseSiteSeoSettingsJson(row.data) : getDefaultSiteSeoSettingsInput()
  return resolveSiteSeoConfig(input)
}

export const getSiteSeoFromDB = unstable_cache(loadSiteSeoFromDB, ['site-seo'], {
  tags: ['site-seo'],
})

export async function getSiteSeoSettingsFormFromDB(): Promise<SiteSeoSettingsFormValues> {
  const row = await prisma.seoSettings.findUnique({
    where: { id: SEO_SETTINGS_ID },
  })

  if (!row) {
    return getDefaultSiteSeoSettingsInput()
  }

  return parseSiteSeoSettingsJson(row.data)
}

export async function saveSiteSeoSettingsToDB(
  values: SiteSeoSettingsFormValues,
  updatedBy?: string,
) {
  const merged = mergeSiteSeoSettingsInput(values)

  await prisma.seoSettings.upsert({
    where: { id: SEO_SETTINGS_ID },
    create: {
      id: SEO_SETTINGS_ID,
      data: merged as SiteSeoSettingsInput,
      updatedBy: updatedBy ?? null,
    },
    update: {
      data: merged as SiteSeoSettingsInput,
      updatedBy: updatedBy ?? null,
    },
  })

  return resolveSiteSeoConfig(merged)
}
