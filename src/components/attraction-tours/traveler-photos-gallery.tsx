'use client'

import { useState } from 'react'
import { IconChevronLeft, IconChevronRight, IconX } from '@/components/icons'

export default function TravelerPhotosGallery({
  photos,
}: {
  photos: Array<{ url: string; alt: string }>
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (photos.length === 0) {
    return null
  }

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % photos.length)
    }
  }

  const goToPrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length)
    }
  }

  const closeModal = () => setSelectedIndex(null)

  const currentPhoto = selectedIndex !== null ? photos[selectedIndex] : null

  return (
    <>
      {/* Thumbnail gallery */}
      <div className="scrollbar-none mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
        {photos.map((photo, index) => (
          <button
            key={photo.url}
            onClick={() => setSelectedIndex(index)}
            className="relative aspect-square w-28 shrink-0 snap-start overflow-hidden rounded-xl bg-zinc-100 transition hover:ring-2 hover:ring-primary sm:w-32"
            aria-label={`Open ${photo.alt}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={photo.alt} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* Lightbox modal */}
      {currentPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={closeModal}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 transition hover:bg-white/20 active:scale-95"
            aria-label="Close"
          >
            <IconX className="size-6 text-white" />
          </button>

          {/* Main image */}
          <div className="relative mx-4 max-h-[80vh] max-w-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPhoto.url}
              alt={currentPhoto.alt}
              className="max-h-[80vh] w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrev()
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 transition hover:bg-white/20 active:scale-95"
                  aria-label="Previous image"
                >
                  <IconChevronLeft className="size-6 text-white" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 transition hover:bg-white/20 active:scale-95"
                  aria-label="Next image"
                >
                  <IconChevronRight className="size-6 text-white" />
                </button>

                {/* Counter */}
                {selectedIndex !== null && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                    {selectedIndex + 1} / {photos.length}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
