'use client'

import { IconChevronLeft, IconChevronRight, IconClose } from '@/components/icons'
import type { BannerPhoto } from '@/lib/tour-config.types'
import { useModalBehavior } from '@/hooks/use-modal-behavior'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

type BannerPhotoLightboxProps = {
  /** The photo to open on. `null` closes the lightbox. */
  photo: BannerPhoto | null
  onClose: () => void
  /**
   * Full set to browse. Defaults to just `photo`, so existing callers keep the
   * previous single-image behaviour and no arrows are shown.
   */
  photos?: BannerPhoto[]
}

export default function BannerPhotoLightbox({
  photo,
  onClose,
  photos,
}: BannerPhotoLightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const items = photos?.length ? photos : photo ? [photo] : []

  // Starts on whichever photo was clicked. The parent gives this component a
  // `key` per open, so each open remounts and re-runs this initialiser — no
  // prop-to-state syncing effect needed.
  const [index, setIndex] = useState(() => {
    const found = items.findIndex((item) => item === photo)
    return found >= 0 ? found : 0
  })

  const step = useCallback(
    (delta: number) => {
      setIndex((current) => (current + delta + items.length) % items.length)
    },
    [items.length],
  )

  const open = Boolean(photo) && items.length > 0
  useModalBehavior({ open, containerRef, onClose })

  useEffect(() => {
    if (!open || items.length < 2) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, items.length, step])

  if (!open) return null

  const current = items[Math.min(index, items.length - 1)]
  const hasMany = items.length > 1

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-200 flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${items.length}: ${current.alt}`}
    >
      {/* Backdrop: a div, not a button. As a button it became the first tab
          stop — a giant invisible control — and screen readers announced two
          separate close actions. Escape and the visible Close button remain. */}
      <div className="absolute inset-0 bg-black/85" onClick={onClose} aria-hidden="true" />

      <figure className="relative z-10 flex max-h-[min(90vh,900px)] w-full max-w-5xl flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 -right-2 z-20 inline-flex size-10 items-center justify-center rounded-full bg-white/95 text-zinc-800 shadow-lg transition hover:bg-white sm:-top-3 sm:-right-3"
          aria-label="Close"
        >
          <IconClose className="size-5" aria-hidden />
        </button>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-black">
          <div className="relative aspect-4/3 max-h-[min(80vh,820px)] w-full sm:aspect-16/10">
            <Image
              src={current.src}
              alt={current.alt}
              fill
              sizes="(max-width: 640px) 100vw, 1024px"
              quality={92}
              className="object-contain"
              priority
            />
          </div>

          {hasMany ? (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-800 shadow-lg transition hover:bg-white sm:left-3"
              >
                <IconChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-800 shadow-lg transition hover:bg-white sm:right-3"
              >
                <IconChevronRight className="size-5" aria-hidden />
              </button>
            </>
          ) : null}
        </div>

        <figcaption className="mt-3 flex items-center justify-center gap-3 text-sm font-medium text-white sm:text-base">
          {current.label ? <span>{current.label}</span> : null}
          {hasMany ? (
            <span className="text-white/70" aria-live="polite">
              {index + 1} / {items.length}
            </span>
          ) : null}
        </figcaption>
      </figure>
    </div>
  )
}
