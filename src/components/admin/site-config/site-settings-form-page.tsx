'use client'

import SiteSettingsForm from '@/components/admin/site-config/site-settings-form'
import { fetchSiteSettingsForm } from '@/lib/admin-site-settings-api'
import { createEmptySiteSettingsValues } from '@/lib/validations/site-settings.validation'
import { usePendingImageStore } from '@/store/pending-image-store'
import { useEffect, useState } from 'react'

export default function SiteSettingsFormPage() {
  const clearAll = usePendingImageStore((state) => state.clearAll)
  const [initialValues, setInitialValues] = useState(createEmptySiteSettingsValues)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    return () => {
      clearAll()
    }
  }, [clearAll])

  useEffect(() => {
    let cancelled = false

    async function loadSettings() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const settings = await fetchSiteSettingsForm()
        if (cancelled) return
        setInitialValues(settings)
      } catch (error) {
        if (cancelled) return
        setLoadError(error instanceof Error ? error.message : 'Failed to load site settings')
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadSettings()

    return () => {
      cancelled = true
    }
  }, [])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl py-16 text-center text-sm text-zinc-500">
        Loading site settings…
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-4xl py-16 text-center">
        <p className="text-sm font-medium text-red-600">{loadError}</p>
      </div>
    )
  }

  return <SiteSettingsForm key={JSON.stringify(initialValues.brand)} initialValues={initialValues} />
}
