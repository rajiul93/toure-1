'use client'

import SiteSeoForm from '@/components/admin/site-seo/site-seo-form'
import { fetchSiteSeoSettingsForm } from '@/lib/admin-site-seo-api'
import { createEmptySiteSeoSettingsValues } from '@/lib/validations/site-seo.validation'
import { usePendingImageStore } from '@/store/pending-image-store'
import { useEffect, useState } from 'react'

export default function SiteSeoFormPage() {
  const clearAll = usePendingImageStore((state) => state.clearAll)
  const [initialValues, setInitialValues] = useState(createEmptySiteSeoSettingsValues)
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
        const settings = await fetchSiteSeoSettingsForm()
        if (cancelled) return
        setInitialValues(settings)
      } catch (error) {
        if (cancelled) return
        setLoadError(error instanceof Error ? error.message : 'Failed to load SEO settings')
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
        Loading SEO settings…
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

  return <SiteSeoForm key={initialValues.global.titleTemplate} initialValues={initialValues} />
}
