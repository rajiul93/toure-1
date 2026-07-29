'use client'

import DeferredImagePicker from '@/components/admin/blog/deferred-image-picker'
import { tourBannerFieldKey } from '@/lib/tour-settings/prepare-tour-settings-submit'
import type { TourBannerPhotoInput } from '@/lib/tour-config.types'
import { MIN_BANNER_PHOTOS } from '@/lib/validations/tour-settings.validation'
import { useState } from 'react'
import { FaChevronDown, FaChevronUp, FaGripVertical, FaPlus, FaTrash } from 'react-icons/fa6'

type PhotoErrors = {
  url?: { message?: string }
  alt_text?: { message?: string }
  label?: { message?: string }
}

type BannerGalleryFieldProps = {
  items: TourBannerPhotoInput[]
  errors?: Array<PhotoErrors | undefined>
  rootError?: string
  onAddFiles: (files: File[]) => void
  onLabelChange: (index: number, label: string) => void
  onAltTextChange: (index: number, altText: string) => void
  onSelectFile: (index: number, file: File) => void
  onClearImage: (index: number) => void
  onRemove: (index: number) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onSetFeatured: (index: number) => void
}

export default function BannerGalleryField({
  items,
  errors,
  rootError,
  onAddFiles,
  onLabelChange,
  onAltTextChange,
  onSelectFile,
  onClearImage,
  onRemove,
  onReorder,
  onSetFeatured,
}: BannerGalleryFieldProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const canRemove = items.length > MIN_BANNER_PHOTOS

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600">
          {items.length} image{items.length === 1 ? '' : 's'} · minimum {MIN_BANNER_PHOTOS}
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-heading transition hover:bg-zinc-50">
          <FaPlus className="size-3.5" aria-hidden="true" />
          Add images
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            className="sr-only"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? [])
              if (files.length > 0) onAddFiles(files)
              event.target.value = ''
            }}
          />
        </label>
      </div>

      {rootError ? <p className="text-xs text-red-600">{rootError}</p> : null}

      {/* Two compact columns so at least four images stay on screen at once —
          a stacked full-width list showed roughly one per screenful. */}
      <ul className="grid gap-3 lg:grid-cols-2">
        {items.map((item, index) => {
          const isDragging = dragIndex === index
          const isOver = overIndex === index && dragIndex !== index

          return (
            <li
              key={item.id}
              data-banner-card
              onDragOver={(event) => {
                event.preventDefault()
                setOverIndex(index)
              }}
              onDrop={(event) => {
                event.preventDefault()
                handleDrop(index)
              }}
              className={`flex gap-2.5 rounded-2xl border bg-zinc-50/70 p-3 transition ${
                isDragging
                  ? 'border-primary/40 opacity-60'
                  : isOver
                    ? 'border-primary bg-primary-soft/40'
                    : 'border-zinc-200'
              }`}
            >
              <div className="flex shrink-0 flex-col items-center gap-1 pt-1">
                <button
                  type="button"
                  aria-label={`Move image ${index + 1} up`}
                  disabled={index === 0}
                  onClick={() => onReorder(index, index - 1)}
                  className="rounded-lg p-1 text-zinc-400 transition hover:bg-white hover:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <FaChevronUp className="size-3" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  draggable
                  aria-label={`Drag image ${index + 1} to reorder`}
                  className="cursor-grab rounded-lg p-1.5 text-zinc-400 transition hover:bg-white hover:text-zinc-600 active:cursor-grabbing"
                  onDragStart={(event) => {
                    setDragIndex(index)
                    event.dataTransfer.effectAllowed = 'move'
                    // Firefox will not start a drag without data.
                    event.dataTransfer.setData('text/plain', String(index))
                  }}
                  onDragEnd={finishDrag}
                >
                  <FaGripVertical className="size-4" aria-hidden="true" />
                </button>

                <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-white px-2 py-0.5 text-xs font-bold text-heading ring-1 ring-zinc-200">
                  {index + 1}
                </span>

                {/* Dragging is pointer-only, so keyboard users get these. */}
                <button
                  type="button"
                  aria-label={`Move image ${index + 1} down`}
                  disabled={index === items.length - 1}
                  onClick={() => onReorder(index, index + 1)}
                  className="rounded-lg p-1 text-zinc-400 transition hover:bg-white hover:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <FaChevronDown className="size-3" aria-hidden="true" />
                </button>
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-heading">
                    <input
                      type="radio"
                      name="banner-feature-image"
                      checked={item.featured}
                      onChange={() => onSetFeatured(index)}
                      className="size-3.5 text-primary focus:ring-primary/30"
                    />
                    Feature
                    {item.featured ? (
                      <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary-dark">
                        Shown large
                      </span>
                    ) : null}
                  </label>

                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    disabled={!canRemove}
                    title={
                      canRemove ? undefined : `At least ${MIN_BANNER_PHOTOS} images are required`
                    }
                    className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent"
                  >
                    <FaTrash className="size-3" aria-hidden="true" />
                    Remove
                  </button>
                </div>

                <div>
                  <label htmlFor={`banner_label_${item.id}`} className="sr-only">
                    Badge label
                  </label>
                  <input
                    id={`banner_label_${item.id}`}
                    value={item.label}
                    onChange={(event) => onLabelChange(index, event.target.value)}
                    placeholder="Badge label"
                    className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {errors?.[index]?.label?.message ? (
                    <p className="mt-1 text-xs text-red-600">{errors[index]?.label?.message}</p>
                  ) : null}
                </div>

                <DeferredImagePicker
                  compact
                  id={tourBannerFieldKey(item.id)}
                  label="Banner image"
                  previewUrl={item.url || undefined}
                  altText={item.alt_text}
                  altError={errors?.[index]?.alt_text?.message}
                  error={errors?.[index]?.url?.message}
                  onAltTextChange={(value) => onAltTextChange(index, value)}
                  onSelect={(file) => onSelectFile(index, file)}
                  onClear={() => onClearImage(index)}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
