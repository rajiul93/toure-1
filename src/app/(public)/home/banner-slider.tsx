'use client'

import type { BannerPhoto } from '@/lib/tour-config.types'
import Image from 'next/image'

function PhotoBadge({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
      {label}
    </span>
  )
}

type BannerSliderProps = {
  bannerPhotos: BannerPhoto[]
  onPhotoSelect: (photo: BannerPhoto) => void
}

export default function BannerSlider({ bannerPhotos, onPhotoSelect }: BannerSliderProps) {
  const [featured, ...tiles] = bannerPhotos

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => onPhotoSelect(featured)}
        className="relative aspect-4/3 w-full cursor-zoom-in overflow-hidden rounded-2xl border-0 p-0 text-left"
        aria-label={`View larger: ${featured.alt}`}
      >
        <Image
          src={featured.src}
          alt={featured.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <PhotoBadge label={featured.label} />
        <span className="pointer-events-none absolute bottom-2 right-2 z-10 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-900 shadow-sm">
          <span
            className="size-3 shrink-0 rounded-[3px] border border-zinc-300 bg-zinc-100"
            aria-hidden="true"
          />
          +26 photos
        </span>
      </button>

      <div className="scrollbar-none flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        {tiles.map((photo, i) => (
          <button
            key={`${photo.src}-${i}`}
            type="button"
            onClick={() => onPhotoSelect(photo)}
            className="relative aspect-4/3 w-[calc((100%-1rem)/2.4)] shrink-0 cursor-zoom-in snap-start overflow-hidden rounded-2xl border-0 p-0 text-left"
            aria-label={`View larger: ${photo.alt}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              loading={i === 0 ? 'eager' : 'lazy'}
              sizes="42vw"
              className="object-cover"
            />
            <PhotoBadge label={photo.label} />
          </button>
        ))}
      </div>
    </div>
  )
}
