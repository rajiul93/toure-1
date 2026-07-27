import type { ResolvedTourConfig } from '@/lib/tour-config.types'
import type { TourSettingsFormValues } from '@/lib/validations/tour-settings.validation'

export async function fetchTourSettingsForm(): Promise<TourSettingsFormValues> {
  const response = await fetch('/api/admin/tour-config', {
    credentials: 'include',
  })

  const data = (await response.json().catch(() => ({}))) as {
    settings?: TourSettingsFormValues
    error?: string
  }

  if (!response.ok || !data.settings) {
    throw new Error(data.error ?? 'Failed to load tour settings')
  }

  return data.settings
}

export async function saveTourSettingsForm(
  values: TourSettingsFormValues,
): Promise<ResolvedTourConfig> {
  const response = await fetch('/api/admin/tour-config', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  const data = (await response.json().catch(() => ({}))) as {
    config?: ResolvedTourConfig
    error?: string
  }

  if (!response.ok || !data.config) {
    throw new Error(data.error ?? 'Failed to save tour settings')
  }

  return data.config
}
