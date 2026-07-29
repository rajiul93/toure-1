'use client'

import Image from 'next/image'
import type { BannerPhoto } from '@/lib/tour-config.types'
import { useState } from 'react'
import BannerPhotoLightbox from './banner-photo-lightbox'
import BannerSlider from './banner-slider'
import { BANNER_FEATURED_SIZES, BANNER_TILE_SIZES } from './banner-image-sizes'

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
          sizes={BANNER_FEATURED_SIZES}
          priority
          className="h-full min-h-0"
        />
      </div>

      <div className="col-span-2 flex min-h-0 flex-col gap-2.5">
        <div className="relative min-h-0 flex-1">
          <BannerPhotoButton photo={second} onSelect={onPhotoSelect} sizes={BANNER_TILE_SIZES} className="h-full min-h-0" />
        </div>
        <div className="relative min-h-0 flex-1">
          <BannerPhotoButton photo={third} onSelect={onPhotoSelect} sizes={BANNER_TILE_SIZES} className="h-full min-h-0" />
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
          sizes={BANNER_FEATURED_SIZES}
          priority
          className="h-full min-h-0"
        />
      </div>

      {tiles.map((photo) => (
        <div key={photo.src} className="relative min-h-0">
          <BannerPhotoButton photo={photo} onSelect={onPhotoSelect} sizes={BANNER_TILE_SIZES} className="h-full min-h-0" />
        </div>
      ))}
    </div>
  )
}

export default function Banner({
  bannerPhotos,
  galleryPhotos,
  viewAllLabel,
}: {
  /** The photos shown in the collage — the layouts expect about five. */
  bannerPhotos: BannerPhoto[]
  /** Optional larger set the lightbox can browse. Defaults to `bannerPhotos`. */
  galleryPhotos?: BannerPhoto[]
  /** Renders a "view all" button when provided. */
  viewAllLabel?: string
}) {
  const [lightboxPhoto, setLightboxPhoto] = useState<BannerPhoto | null>(null)
  const allPhotos = galleryPhotos?.length ? galleryPhotos : bannerPhotos

  // The tablet and grid layouts destructure three photos and read `.src` on
  // each; a tour config saved with fewer would crash the whole page.
  if (bannerPhotos.length < 3) return null

  return (
    <>
      <section className="relative h-full w-full min-h-0" aria-label="Photo gallery">
        {viewAllLabel ? (
          <button
            type="button"
            onClick={() => setLightboxPhoto(allPhotos[0])}
            className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-heading shadow-md transition hover:bg-white sm:text-sm"
          >
            {viewAllLabel}
          </button>
        ) : null}
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

      {/* Keyed per open so the lightbox remounts and starts on the clicked
          photo without a prop-syncing effect. */}
      <BannerPhotoLightbox
        key={lightboxPhoto ? allPhotos.indexOf(lightboxPhoto) : 'closed'}
        photo={lightboxPhoto}
        photos={allPhotos}
        onClose={() => setLightboxPhoto(null)}
      />
    </>
  )
}
