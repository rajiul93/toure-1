import type { ResolvedSiteSeoConfig } from '@/lib/site-seo.types'
import type { SiteSeoSettingsFormValues } from '@/lib/validations/site-seo.validation'

export async function fetchSiteSeoSettingsForm(): Promise<SiteSeoSettingsFormValues> {
  const response = await fetch('/api/admin/site-seo', {
    credentials: 'include',
  })

  const data = (await response.json().catch(() => ({}))) as {
    settings?: SiteSeoSettingsFormValues
    error?: string
  }

  if (!response.ok || !data.settings) {
    throw new Error(data.error ?? 'Failed to load SEO settings')
  }

  return data.settings
}

export async function saveSiteSeoSettingsForm(
  values: SiteSeoSettingsFormValues,
): Promise<ResolvedSiteSeoConfig> {
  const response = await fetch('/api/admin/site-seo', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  const data = (await response.json().catch(() => ({}))) as {
    config?: ResolvedSiteSeoConfig
    error?: string
  }

  if (!response.ok || !data.config) {
    throw new Error(data.error ?? 'Failed to save SEO settings')
  }

  return data.config
}
