'use client'

import { IconClose } from '@/components/icons'
import type { BannerPhoto } from '@/lib/tour-config.types'
import { useModalBehavior } from '@/hooks/use-modal-behavior'
import Image from 'next/image'
import { useRef } from 'react'

type BannerPhotoLightboxProps = {
  photo: BannerPhoto | null
  onClose: () => void
}

export default function BannerPhotoLightbox({ photo, onClose }: BannerPhotoLightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Escape, focus trap, focus restore and scroll lock.
  useModalBehavior({ open: Boolean(photo), containerRef, onClose })

  if (!photo) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-200 flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
    >
      {/* Backdrop: a div, not a button. As a button it became the first tab
          stop — a giant invisible control — and screen readers announced two
          separate close actions. Escape and the visible Close button remain. */}
      <div
        className="absolute inset-0 bg-black/85"
        onClick={onClose}
        aria-hidden="true"
      />

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
          <div className="relative aspect-[4/3] max-h-[min(80vh,820px)] w-full sm:aspect-[16/10]">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 100vw, 1024px"
              quality={92}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {photo.label ? (
          <figcaption className="mt-3 text-center text-sm font-medium text-white sm:text-base">
            {photo.label}
          </figcaption>
        ) : null}
      </figure>
    </div>
  )
}
