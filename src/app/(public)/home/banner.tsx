'use client'

import Image from 'next/image'
import type { BannerPhoto } from '@/lib/tour-config.types'
import { useState } from 'react'
import BannerPhotoLightbox from './banner-photo-lightbox'
import BannerSlider from './banner-slider'

function PhotoBadge({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm sm:bottom-3 sm:left-3 sm:px-2.5 sm:py-1">
      {label}
    </span>
  )
}

type BannerPhotoButtonProps = {
  photo: BannerPhoto
  onSelect: (photo: BannerPhoto) => void
  sizes: string
  priority?: boolean
  loading?: 'eager' | 'lazy'
  className?: string
}

function BannerPhotoButton({
  photo,
  onSelect,
  sizes,
  priority = false,
  loading,
  className = '',
}: BannerPhotoButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(photo)}
      className={`relative block h-full w-full cursor-zoom-in overflow-hidden rounded-2xl border-0 p-0 text-left ${className}`}
      aria-label={`View larger: ${photo.alt}`}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        priority={priority}
        loading={loading}
        sizes={sizes}
        className="object-cover"
      />
      <PhotoBadge label={photo.label} />
    </button>
  )
}

function BannerTablet({
  bannerPhotos,
  onPhotoSelect,
}: {
  bannerPhotos: BannerPhoto[]
  onPhotoSelect: (photo: BannerPhoto) => void
}) {
  const [featured, second, third] = bannerPhotos

  return (
    <div className="grid h-full min-h-0 grid-cols-5 gap-2.5">
      <div className="relative col-span-3 min-h-0">
        <BannerPhotoButton
          photo={featured}
          onSelect={onPhotoSelect}
          sizes="60vw"
          priority
          className="h-full min-h-0"
        />
      </div>

      <div className="col-span-2 flex min-h-0 flex-col gap-2.5">
        <div className="relative min-h-0 flex-1">
          <BannerPhotoButton photo={second} onSelect={onPhotoSelect} sizes="40vw" className="h-full min-h-0" />
        </div>
        <div className="relative min-h-0 flex-1">
          <BannerPhotoButton photo={third} onSelect={onPhotoSelect} sizes="40vw" className="h-full min-h-0" />
        </div>
      </div>
    </div>
  )
}

function BannerGrid({
  bannerPhotos,
  onPhotoSelect,
}: {
  bannerPhotos: BannerPhoto[]
  onPhotoSelect: (photo: BannerPhoto) => void
}) {
  const [featured, ...tiles] = bannerPhotos

  return (
    <div className="grid h-full min-h-0 grid-cols-4 grid-rows-2 gap-2.5">
      <div className="relative col-span-2 row-span-2 min-h-0">
        <BannerPhotoButton
          photo={featured}
          onSelect={onPhotoSelect}
          sizes="50vw"
          priority
          className="h-full min-h-0"
        />
      </div>

      {tiles.map((photo) => (
        <div key={photo.src} className="relative min-h-0">
          <BannerPhotoButton photo={photo} onSelect={onPhotoSelect} sizes="25vw" className="h-full min-h-0" />
        </div>
      ))}
    </div>
  )
}

export default function Banner({ bannerPhotos }: { bannerPhotos: BannerPhoto[] }) {
  const [lightboxPhoto, setLightboxPhoto] = useState<BannerPhoto | null>(null)

  return (
    <>
      <section className="h-full w-full min-h-0" aria-label="Photo gallery">
        <div className="h-full md:hidden">
          <BannerSlider bannerPhotos={bannerPhotos} onPhotoSelect={setLightboxPhoto} />
        </div>
        <div className="hidden aspect-2/1 md:block lg:hidden">
          <BannerTablet bannerPhotos={bannerPhotos} onPhotoSelect={setLightboxPhoto} />
        </div>
        <div className="hidden h-full lg:block">
          <BannerGrid bannerPhotos={bannerPhotos} onPhotoSelect={setLightboxPhoto} />
        </div>
      </section>

      <BannerPhotoLightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
    </>
  )
}
