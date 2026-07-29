import { prisma } from '@/lib/db'
import { getDefaultTourSettingsInput } from '@/lib/tour-config.defaults'
import { mergeTourSettingsInput, parseTourSettingsJson, resolveTourConfig } from '@/lib/tour-config.merge'
import type { TourSettingsInput } from '@/lib/tour-config.types'
import type { TourSettingsFormValues } from '@/lib/validations/tour-settings.validation'
import { unstable_cache } from 'next/cache'

const TOUR_SETTINGS_ID = 'default'

async function loadTourConfigFromDB() {
  const row = await prisma.tourSettings.findUnique({
    where: { id: TOUR_SETTINGS_ID },
  })

  const input = row ? parseTourSettingsJson(row.data) : getDefaultTourSettingsInput()
  return resolveTourConfig(input)
}

/**
 * Bump whenever `ResolvedTourConfig` gains or changes a field. Entries cached
 * under the old key still hold the old shape, and consumers that read a new
 * field would get `undefined` and crash — a stale cache is not just stale data
 * here, it is a runtime error. v3 added `itineraryStops`.
 */
const TOUR_CONFIG_CACHE_KEY = 'tour-config-v3'

export const getTourConfigFromDB = unstable_cache(
  loadTourConfigFromDB,
  [TOUR_CONFIG_CACHE_KEY],
  {
    tags: ['tour-config'],
    // Admin saves revalidate the tag; this only bounds how long a bad or stale
    // entry can survive if that ever fails to fire.
    revalidate: 300,
  },
)

export async function getTourSettingsFormFromDB(): Promise<TourSettingsFormValues> {
  const row = await prisma.tourSettings.findUnique({
    where: { id: TOUR_SETTINGS_ID },
  })

  if (!row) {
    return getDefaultTourSettingsInput()
  }

  return parseTourSettingsJson(row.data)
}

export async function saveTourSettingsToDB(
  values: TourSettingsFormValues,
  updatedBy?: string,
) {
  const merged = mergeTourSettingsInput(values)

  await prisma.tourSettings.upsert({
    where: { id: TOUR_SETTINGS_ID },
    create: {
      id: TOUR_SETTINGS_ID,
      data: merged as TourSettingsInput,
      updatedBy: updatedBy ?? null,
    },
    update: {
      data: merged as TourSettingsInput,
      updatedBy: updatedBy ?? null,
    },
  })

  return resolveTourConfig(merged)
}
