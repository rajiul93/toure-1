'use client'

import { galleryFieldKey } from '@/lib/blog-gallery'
import type { BlogGalleryImageValues } from '@/lib/validations/blog-form.validation'
import { useState } from 'react'
import { FaGripVertical, FaPlus, FaTrash } from 'react-icons/fa6'

type BlogGalleryFieldProps = {
  items: BlogGalleryImageValues[]
  onAddFiles: (files: File[]) => void
  onUpdate: (index: number, item: BlogGalleryImageValues) => void
  onRemove: (index: number) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  errors?: Array<{ url?: { message?: string }; alt_text?: { message?: string } } | undefined>
}

export default function BlogGalleryField({
  items,
  onAddFiles,
  onUpdate,
  onRemove,
  onReorder,
  errors,
}: BlogGalleryFieldProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  function finishDrag() {
    setDragIndex(null)
    setOverIndex(null)
  }

  function handleDrop(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) {
      finishDrag()
      return
    }

    onReorder(dragIndex, dropIndex)
    finishDrag()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-heading transition hover:bg-zinc-50">
          <FaPlus className="mr-2 size-3.5" aria-hidden="true" />
          Add gallery images
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            className="sr-only"
            onChange={(event) => {
              const files = event.target.files ? Array.from(event.target.files) : []
              if (files.length) onAddFiles(files)
              event.target.value = ''
            }}
          />
        </label>
        <p className="text-xs text-zinc-500">
          Up to 20 images. Drag to reorder — order matches the blog detail gallery.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-500">
          No gallery images yet. Add photos for the blog detail swiper gallery.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => {
            const isDragging = dragIndex === index
            const isOver = overIndex === index && dragIndex !== null && dragIndex !== index

            return (
              <li
                key={item.id}
                onDragOver={(event) => {
                  event.preventDefault()
                  setOverIndex(index)
                }}
                onDragLeave={() => {
                  if (overIndex === index) setOverIndex(null)
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  handleDrop(index)
                }}
                className={`flex gap-3 rounded-2xl border bg-zinc-50/70 p-3 transition sm:gap-4 sm:p-4 ${
                  isDragging
                    ? 'border-primary/40 opacity-60'
                    : isOver
                      ? 'border-primary bg-primary-soft/40'
                      : 'border-zinc-200'
                }`}
              >
                <div className="flex shrink-0 flex-col items-center gap-2 pt-1">
                  <button
                    type="button"
                    draggable
                    aria-label={`Drag image ${index + 1}`}
                    className="cursor-grab rounded-lg p-1.5 text-zinc-400 transition hover:bg-white hover:text-zinc-600 active:cursor-grabbing"
                    onDragStart={(event) => {
                      setDragIndex(index)
                      event.dataTransfer.effectAllowed = 'move'
                    }}
                    onDragEnd={finishDrag}
                  >
                    <FaGripVertical className="size-4" aria-hidden="true" />
                  </button>
                  <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-white px-2 py-0.5 text-xs font-bold text-heading ring-1 ring-zinc-200">
                    {index + 1}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    {item.url ? (
                      <div className="w-full shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white sm:w-36">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.alt_text || `Gallery image ${index + 1}`}
                          className="aspect-[4/3] w-full object-cover"
                          draggable={false}
                        />
                      </div>
                    ) : (
                      <div className="w-full rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500 sm:w-36">
                        Waiting for preview…
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-heading">Gallery image {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => onRemove(index)}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 transition hover:text-red-700"
                        >
                          <FaTrash className="size-3.5" aria-hidden="true" />
                          Remove
                        </button>
                      </div>

                      <label
                        htmlFor={`${galleryFieldKey(item.id)}_alt`}
                        className="mb-1.5 block text-sm font-medium text-heading"
                      >
                        Alt text
                      </label>
                      <input
                        id={`${galleryFieldKey(item.id)}_alt`}
                        type="text"
                        value={item.alt_text}
                        onChange={(event) =>
                          onUpdate(index, { ...item, alt_text: event.target.value })
                        }
                        className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Describe this photo"
                      />
                      {errors?.[index]?.alt_text?.message ? (
                        <p className="mt-1 text-xs text-red-600">{errors[index]?.alt_text?.message}</p>
                      ) : null}
                      {errors?.[index]?.url?.message ? (
                        <p className="mt-2 text-xs text-red-600">{errors[index]?.url?.message}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
