'use client'

import BlogForm from '@/components/admin/blog/blog-form'
import { fetchAdminBlog } from '@/lib/admin-blog-api'
import { createEmptyBlogFormValues } from '@/lib/validations/blog-form.validation'
import { usePendingImageStore } from '@/store/pending-image-store'
import { useEffect, useState } from 'react'

export default function BlogFormPage({ blogId }: { blogId: string }) {
  const isCreateMode = blogId === 'new'
  const clearAll = usePendingImageStore((state) => state.clearAll)
  const [initialValues, setInitialValues] = useState(createEmptyBlogFormValues)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!isCreateMode)

  useEffect(() => {
    return () => {
      clearAll()
    }
  }, [clearAll])

  useEffect(() => {
    if (isCreateMode) return

    let cancelled = false

    async function loadBlog() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const blog = await fetchAdminBlog(blogId)
        if (cancelled) return

        if (!blog.form) {
          throw new Error('Blog data is missing')
        }

        setInitialValues(blog.form)
      } catch (error) {
        if (cancelled) return
        setLoadError(error instanceof Error ? error.message : 'Failed to load blog')
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadBlog()

    return () => {
      cancelled = true
    }
  }, [blogId, isCreateMode])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl py-16 text-center text-sm text-zinc-500">
        Loading blog...
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-5xl py-16 text-center">
        <p className="text-sm font-medium text-red-600">{loadError}</p>
      </div>
    )
  }

  return (
    <BlogForm
      key={isCreateMode ? 'new' : blogId}
      mode={isCreateMode ? 'create' : 'update'}
      blogId={blogId}
      initialValues={initialValues}
    />
  )
}
