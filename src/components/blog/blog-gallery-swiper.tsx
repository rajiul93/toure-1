'use client'

import { IconChevronLeft, IconChevronRight } from '@/components/icons'
import type { BlogGalleryImage } from '@/lib/blog-gallery'
import Image from 'next/image'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Swiper as SwiperType } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import 'swiper/css'

const GALLERY_IMAGE_SIZES = '(max-width: 640px) 100vw, 896px'
const GALLERY_IMAGE_QUALITY = 92

function GallerySlideImage({
  image,
  priority = false,
}: {
  image: BlogGalleryImage
  priority?: boolean
}) {
  return (
    <Image
      src={image.url}
      alt={image.alt_text || 'Blog gallery image'}
      fill
      sizes={GALLERY_IMAGE_SIZES}
      quality={GALLERY_IMAGE_QUALITY}
      priority={priority}
      draggable={false}
      className="object-cover"
    />
  )
}

type BlogGallerySwiperProps = {
  images: BlogGalleryImage[]
  variant?: 'hero' | 'inline'
  children?: ReactNode
}

export default function BlogGallerySwiper({
  images,
  variant = 'inline',
  children,
}: BlogGallerySwiperProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null)
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([])
  const showControls = images.length > 1
  const isFirstSlide = activeIndex === 0
  const isLastSlide = activeIndex === images.length - 1

  useEffect(() => {
    thumbRefs.current[activeIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [activeIndex])

  if (images.length === 0) return null

  const goToSlide = (index: number) => {
    mainSwiper?.slideTo(index)
  }

  const goToPrevious = () => {
    mainSwiper?.slidePrev()
  }

  const goToNext = () => {
    mainSwiper?.slideNext()
  }

  const mainSwiperEl = (
    <>
      {showControls ? (
        <>
          <div className="blog-gallery-counter" aria-live="polite">
            {activeIndex + 1}
            <span className="blog-gallery-counter-sep">/</span>
            {images.length}
          </div>

          <button
            type="button"
            className="blog-gallery-nav blog-gallery-nav--prev"
            aria-label="Previous image"
            onClick={goToPrevious}
            disabled={isFirstSlide}
          >
            <IconChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            className="blog-gallery-nav blog-gallery-nav--next"
            aria-label="Next image"
            onClick={goToNext}
            disabled={isLastSlide}
          >
            <IconChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </>
      ) : null}

      <Swiper
        onSwiper={setMainSwiper}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        initialSlide={0}
        speed={400}
        className="blog-gallery-main"
      >
        {images.map((image, index) => (
          <SwiperSlide key={image.id} className="blog-gallery-slide">
            <GallerySlideImage image={image} priority={index === 0} />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  )

  const thumbsEl = showControls ? (
    <div className="blog-gallery-thumbs" role="tablist" aria-label="Gallery thumbnails">
      {images.map((image, index) => {
        const isActive = index === activeIndex
        return (
          <button
            key={`thumb-${image.id}`}
            ref={(node) => {
              thumbRefs.current[index] = node
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Show image ${index + 1}`}
            onClick={() => goToSlide(index)}
            className={`blog-gallery-thumb${isActive ? ' is-active' : ''}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="" draggable={false} />
          </button>
        )
      })}
    </div>
  ) : null

  if (images.length === 1) {
    return (
      <div
        className={`blog-gallery-swiper blog-gallery-swiper--single${variant === 'hero' ? ' blog-gallery-swiper--hero' : ''}`}
      >
        <div className={variant === 'hero' ? 'blog-gallery-hero-frame' : 'blog-gallery-frame'}>
          <GallerySlideImage image={images[0]} priority />
          {variant === 'hero' ? children : null}
        </div>
      </div>
    )
  }

  return (
    <div className={`blog-gallery-swiper${variant === 'hero' ? ' blog-gallery-swiper--hero' : ''}`}>
      {variant === 'hero' ? (
        <div className="blog-gallery-hero-frame">
          {mainSwiperEl}
          {children}
        </div>
      ) : (
        <div className="blog-gallery-frame">{mainSwiperEl}</div>
      )}
      {thumbsEl}
    </div>
  )
}
