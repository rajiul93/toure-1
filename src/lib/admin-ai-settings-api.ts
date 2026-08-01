import type { AiSettingsInput } from '@/lib/ai-settings.types'

export async function fetchAiSettings(): Promise<AiSettingsInput> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/admin/ai-settings`, {
    credentials: 'include',
  })

  const data = (await response.json().catch(() => ({}))) as {
    settings?: AiSettingsInput
    error?: string
  }

  if (!response.ok || !data.settings) {
    throw new Error(data.error ?? 'Failed to load AI settings')
  }

  return data.settings
}

export async function saveAiSettings(values: AiSettingsInput): Promise<AiSettingsInput> {
  const response = await fetch('/api/admin/ai-settings', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  const data = (await response.json().catch(() => ({}))) as {
    settings?: AiSettingsInput
    error?: string
  }

  if (!response.ok || !data.settings) {
    throw new Error(data.error ?? 'Failed to save AI settings')
  }

  return data.settings
}
