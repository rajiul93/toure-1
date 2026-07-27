import type { SiteSettingsFormValues } from '@/lib/validations/site-settings.validation'
import type { ResolvedSiteConfig } from '@/lib/site-config.types'

export async function fetchSiteSettingsForm(): Promise<SiteSettingsFormValues> {
  const response = await fetch('/api/admin/site-config', {
    credentials: 'include',
  })

  const data = (await response.json().catch(() => ({}))) as {
    settings?: SiteSettingsFormValues
    error?: string
  }

  if (!response.ok || !data.settings) {
    throw new Error(data.error ?? 'Failed to load site settings')
  }

  return data.settings
}

export async function saveSiteSettingsForm(
  values: SiteSettingsFormValues,
): Promise<ResolvedSiteConfig> {
  const response = await fetch('/api/admin/site-config', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  const data = (await response.json().catch(() => ({}))) as {
    config?: ResolvedSiteConfig
    error?: string
  }

  if (!response.ok || !data.config) {
    throw new Error(data.error ?? 'Failed to save site settings')
  }

  return data.config
}
