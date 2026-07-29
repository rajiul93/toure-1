'use client'

import {
  deleteAdminAttractionTour,
  listAdminAttractionTours,
  toggleAdminAttractionTourPublished,
  type AdminAttractionTourList,
} from '@/lib/admin-attraction-tour-api'
import type { AdminAttractionTourListItem } from '@/lib/services/attraction-tour.service'
import { formatRelativeTime } from '@/lib/dayjs'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { FaPen, FaPlus, FaStar, FaTrash } from 'react-icons/fa6'

function PublishToggle({
  tour,
  disabled,
  onToggle,
}: {
  tour: AdminAttractionTourListItem
  disabled: boolean
  onToggle: (tour: AdminAttractionTourListItem) => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(tour)}
      className={[
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-60',
        tour.isPublished ? 'bg-emerald-500' : 'bg-zinc-300',
      ].join(' ')}
      aria-label={tour.isPublished ? `Unpublish ${tour.title}` : `Publish ${tour.title}`}
      title={tour.isPublished ? 'Published — click to draft' : 'Draft — click to publish'}
    >
      <span
        className={[
          'inline-block size-5 rounded-full bg-white shadow transition',
          tour.isPublished ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  )
}

function Thumbnail({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative size-14 overflow-hidden rounded-xl bg-zinc-100">
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes="56px" />
      ) : (
        <div className="flex size-full items-center justify-center text-[10px] font-semibold uppercase text-zinc-400">
          No img
        </div>
      )}
    </div>
  )
}

function Rating({ average, reviewCount }: { average: number; reviewCount: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <FaStar className="size-3 text-primary" aria-hidden="true" />
      {average.toFixed(1)}
      <span className="text-xs text-zinc-400">({reviewCount})</span>
    </span>
  )
}

export default function AdminAttractionToursClient() {
  const [data, setData] = useState<AdminAttractionTourList | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  /** Used by event handlers, never inside an effect body. */
  const load = useCallback(async () => {
    setError(null)
    try {
      setData(await listAdminAttractionTours())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tours')
    }
  }, [])

  // Every setState happens in a promise callback rather than synchronously in
  // the effect body, which would trigger a cascading render.
  useEffect(() => {
    let cancelled = false

    listAdminAttractionTours()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load tours')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function onTogglePublished(tour: AdminAttractionTourListItem) {
    const next = !tour.isPublished

    // Flip immediately, roll back if the request fails — the switch should feel
    // instant even though it revalidates public pages server-side.
    setData((current) =>
      current
        ? {
            ...current,
            items: current.items.map((item) =>
              item.id === tour.id ? { ...item, isPublished: next } : item,
            ),
          }
        : current,
    )
    setActionId(tour.id)
    setError(null)

    try {
      await toggleAdminAttractionTourPublished(tour.id, next)
    } catch (err) {
      setData((current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) =>
                item.id === tour.id ? { ...item, isPublished: tour.isPublished } : item,
              ),
            }
          : current,
      )
      setError(err instanceof Error ? err.message : 'Failed to update publish status')
    } finally {
      setActionId(null)
    }
  }

  async function onDelete(tour: AdminAttractionTourListItem) {
    if (!window.confirm(`Delete "${tour.title}"? It will be hidden from the site.`)) return

    setActionId(tour.id)
    try {
      await deleteAdminAttractionTour(tour.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tour')
    } finally {
      setActionId(null)
    }
  }

  const tours = data?.items ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-heading">Attraction tours</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Tours shown at /attraction-tours and their detail pages.
          </p>
        </div>
        <Link
          href="/admin/attraction-tours/new"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
        >
          <FaPlus className="size-3.5" aria-hidden="true" />
          New tour
        </Link>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">Loading tours…</p>
        ) : tours.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">
            No tours yet — create your first one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-184 text-left text-sm">
              <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 sm:px-6">Image</th>
                  <th className="px-4 py-3">Tour</th>
                  <th className="px-4 py-3 whitespace-nowrap">Price</th>
                  <th className="px-4 py-3 whitespace-nowrap">Rating</th>
                  <th className="px-4 py-3 whitespace-nowrap">Published</th>
                  <th className="px-4 py-3 whitespace-nowrap">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {tours.map((tour) => {
                  const isBusy = actionId === tour.id

                  return (
                    <tr key={tour.id} className="align-middle">
                      <td className="px-4 py-4 sm:px-6">
                        <Thumbnail src={tour.imageUrl} alt={tour.imageAlt || tour.title} />
                      </td>

                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/attraction-tours/${tour.id}`}
                          className="block max-w-xs font-semibold text-heading transition hover:text-primary sm:max-w-md"
                        >
                          {tour.title}
                        </Link>
                        <span className="mt-0.5 block truncate text-xs text-zinc-500">
                          /attraction-tours/{tour.slug}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap font-semibold text-heading">
                        {tour.priceFrom}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-zinc-600">
                        <Rating average={tour.ratingAverage} reviewCount={tour.reviewCount} />
                      </td>

                      <td className="px-4 py-4">
                        <PublishToggle
                          tour={tour}
                          disabled={isBusy}
                          onToggle={onTogglePublished}
                        />
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-xs text-zinc-500">
                        <time dateTime={tour.updatedAt}>{formatRelativeTime(tour.updatedAt)}</time>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/attraction-tours/${tour.id}`}
                            aria-label={`Edit ${tour.title}`}
                            title="Edit"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-zinc-50"
                          >
                            <FaPen className="size-3" aria-hidden="true" />
                            Edit
                          </Link>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => onDelete(tour)}
                            aria-label={`Delete ${tour.title}`}
                            title="Delete"
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <FaTrash className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
