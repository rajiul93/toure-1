'use client'

import Image from 'next/image'
import { useTourConfig } from '@/components/tour-config/tour-config-provider'
import BannerSlider from './banner-slider'

function PhotoBadge({ label }: { label: string }) {
  return (
    <span className="absolute bottom-2 left-2 z-10 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm sm:bottom-3 sm:left-3 sm:px-2.5 sm:py-1">
      {label}
    </span>
  )
}

function PhotoCountBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`absolute z-10 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-900 shadow-sm sm:px-3 sm:py-1.5 ${className}`}>
      <span
        className="size-3 shrink-0 rounded-[3px] border border-zinc-300 bg-zinc-100 sm:size-3.5"
        aria-hidden="true"
      />
      +26 photos
    </span>
  )
}

function BannerTablet({ bannerPhotos }: { bannerPhotos: ReturnType<typeof useTourConfig>['bannerPhotos'] }) {
  const [featured, second, third] = bannerPhotos

  return (
    <div className="grid h-full min-h-0 grid-cols-5 gap-2.5">
      <div className="relative col-span-3 min-h-0 overflow-hidden rounded-2xl">
        <Image
          src={featured.src}
          alt={featured.alt}
          fill
          priority
          sizes="60vw"
          className="object-cover"
        />
        <PhotoBadge label={featured.label} />
        <PhotoCountBadge className="bottom-3 right-3" />
      </div>

      <div className="col-span-2 flex min-h-0 flex-col gap-2.5">
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl">
          <Image
            src={second.src}
            alt={second.alt}
            fill
            sizes="40vw"
            className="object-cover"
          />
          <PhotoBadge label={second.label} />
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl">
          <Image
            src={third.src}
            alt={third.alt}
            fill
            sizes="40vw"
            className="object-cover"
          />
          <PhotoBadge label={third.label} />
        </div>
      </div>
    </div>
  )
}

function BannerGrid({ bannerPhotos }: { bannerPhotos: ReturnType<typeof useTourConfig>['bannerPhotos'] }) {
  const [featured, ...tiles] = bannerPhotos

  return (
    <div className="grid h-full min-h-0 grid-cols-4 grid-rows-2 gap-2.5">
      <div className="relative col-span-2 row-span-2 min-h-0 overflow-hidden rounded-2xl">
        <Image
          src={featured.src}
          alt={featured.alt}
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <PhotoBadge label={featured.label} />
        <PhotoCountBadge className="bottom-2 right-2 sm:bottom-3 sm:right-3" />
      </div>

      {tiles.map((photo) => (
        <div
          key={photo.src}
          className="relative min-h-0 overflow-hidden rounded-2xl"
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="25vw"
            className="object-cover"
          />
          <PhotoBadge label={photo.label} />
        </div>
      ))}
    </div>
  )
}

export default function Banner() {
  const { bannerPhotos } = useTourConfig()

  return (
    <section className="h-full w-full min-h-0" aria-label="Photo gallery">
      <div className="h-full md:hidden">
        <BannerSlider bannerPhotos={bannerPhotos} />
      </div>
      <div className="hidden aspect-2/1 md:block lg:hidden">
        <BannerTablet bannerPhotos={bannerPhotos} />
      </div>
      <div className="hidden h-full lg:block">
        <BannerGrid bannerPhotos={bannerPhotos} />
      </div>
    </section>
  )
}
