import { prisma } from '@/lib/db'
import { getDefaultAiSettings, type AiSettingsInput } from '@/lib/ai-settings.types'
import { unstable_cache } from 'next/cache'

const AI_SETTINGS_ID = 'default'

async function loadAiSettingsFromDB(): Promise<AiSettingsInput> {
  const row = await prisma.aiSettings.findUnique({
    where: { id: AI_SETTINGS_ID },
  })

  if (!row) {
    return getDefaultAiSettings()
  }

  // Rows saved before a field existed simply omit it, so merge over defaults to
  // keep every key present (blank rather than undefined) for form inputs.
  return { ...getDefaultAiSettings(), ...(row.data as Partial<AiSettingsInput>) }
}

export const getAiSettingsFromDB = unstable_cache(
  loadAiSettingsFromDB,
  ['ai-settings-v1'],
  { tags: ['ai-settings'], revalidate: 300 },
)

export async function saveAiSettingsToDB(
  values: AiSettingsInput,
  updatedBy?: string,
): Promise<AiSettingsInput> {
  const result = await prisma.aiSettings.upsert({
    where: { id: AI_SETTINGS_ID },
    create: {
      id: AI_SETTINGS_ID,
      data: values,
      updatedBy: updatedBy ?? null,
    },
    update: {
      data: values,
      updatedBy: updatedBy ?? null,
    },
  })

  return result.data as AiSettingsInput
}
