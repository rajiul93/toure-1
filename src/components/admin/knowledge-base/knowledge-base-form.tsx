'use client'

import { createEmptyKnowledgeBaseValues } from '@/lib/validations/knowledge-base.validation'
import {
  knowledgeBaseFormSchema,
  KNOWLEDGE_BASE_CATEGORIES,
} from '@/lib/validations/knowledge-base.validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { saveKnowledgeBaseEntry } from '@/lib/admin-knowledge-base-api'

type FormValues = z.infer<typeof knowledgeBaseFormSchema>

export default function KnowledgeBaseForm({
  entry,
  isNew,
  tourOptions,
}: {
  entry?: { id: string } & FormValues
  isNew: boolean
  tourOptions: { slug: string; title: string; isPublished: boolean }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefillQuestion = searchParams.get('question')

  // A <select> silently rewrites a value it has no option for, which would
  // quietly re-scope an entry whose tour was since deleted or renamed. Keep the
  // stored slug selectable so saving an untouched form can't change it.
  const orphanSlug =
    entry?.tourSlug && !tourOptions.some((t) => t.slug === entry.tourSlug)
      ? entry.tourSlug
      : null

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(knowledgeBaseFormSchema),
    defaultValues: entry || createEmptyKnowledgeBaseValues(),
  })

  useEffect(() => {
    if (prefillQuestion && isNew) {
      reset((prev) => ({
        ...prev,
        question: decodeURIComponent(prefillQuestion),
      }))
    }
  }, [prefillQuestion, isNew, reset])

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setError(null)

    try {
      await saveKnowledgeBaseEntry(data, entry?.id)
      router.push('/admin/knowledge-base')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="question" className="block text-sm font-semibold text-heading">
          Question
        </label>
        <input
          id="question"
          type="text"
          placeholder="What is your question?"
          {...register('question')}
          className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.question && (
          <p className="mt-1 text-sm text-red-600">{errors.question.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="answer" className="block text-sm font-semibold text-heading">
          Answer
        </label>
        <textarea
          id="answer"
          placeholder="Provide a clear, concise answer..."
          rows={6}
          {...register('answer')}
          className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.answer && (
          <p className="mt-1 text-sm text-red-600">{errors.answer.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-semibold text-heading">
          Category
        </label>
        <select
          id="category"
          {...register('category')}
          className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {KNOWLEDGE_BASE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="tourSlug" className="block text-sm font-semibold text-heading">
          Tour
        </label>
        <select
          id="tourSlug"
          {...register('tourSlug')}
          className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Site-wide (applies everywhere)</option>
          {tourOptions.map((tour) => (
            <option key={tour.slug} value={tour.slug}>
              {tour.title} ({tour.slug})
              {tour.isPublished ? '' : ' — draft'}
            </option>
          ))}
          {orphanSlug && (
            <option value={orphanSlug}>{orphanSlug} — tour no longer exists</option>
          )}
        </select>
        <p className="mt-1 text-xs text-zinc-500">
          Site-wide entries are given to the AI on every page. Picking a tour limits this
          answer to that tour&apos;s page.
        </p>
      </div>

      <div>
        <label htmlFor="sortOrder" className="block text-sm font-semibold text-heading">
          Sort Order
        </label>
        <input
          id="sortOrder"
          type="number"
          min="0"
          {...register('sortOrder', { valueAsNumber: true })}
          className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Lower numbers appear first when building the AI prompt.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isPublished"
          type="checkbox"
          {...register('isPublished')}
          className="rounded border border-zinc-300"
        />
        <label htmlFor="isPublished" className="text-sm font-semibold text-heading">
          Publish immediately (visible to AI)
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Entry'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 px-6 py-2 font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
