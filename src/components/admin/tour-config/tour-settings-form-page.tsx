'use client'

import TourSettingsForm from '@/components/admin/tour-config/tour-settings-form'
import { fetchTourSettingsForm } from '@/lib/admin-tour-settings-api'
import { createEmptyTourSettingsValues } from '@/lib/validations/tour-settings.validation'
import { usePendingImageStore } from '@/store/pending-image-store'
import { useEffect, useState } from 'react'

export default function TourSettingsFormPage() {
  const clearAll = usePendingImageStore((state) => state.clearAll)
  const [initialValues, setInitialValues] = useState(createEmptyTourSettingsValues)
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
        const settings = await fetchTourSettingsForm()
        if (cancelled) return
        setInitialValues(settings)
      } catch (error) {
        if (cancelled) return
        setLoadError(error instanceof Error ? error.message : 'Failed to load tour settings')
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
        Loading tour settings…
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

  return <TourSettingsForm key={initialValues.tour.slug} initialValues={initialValues} />
}
