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

export const getTourConfigFromDB = unstable_cache(
  loadTourConfigFromDB,
  ['tour-config-v2'],
  { tags: ['tour-config'] },
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
