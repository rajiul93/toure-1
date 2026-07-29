'use client'

import type { AttractionTourDetail } from '@/lib/attraction-tour-detail'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa6'

type TourReviewsSliderProps = {
  rating: AttractionTourDetail['rating']
  reviews: AttractionTourDetail['reviews']
}

const SCROLL_EPSILON = 2

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-heading">
      <FaStar className="size-4 text-primary" aria-hidden />
      {rating.toFixed(1)}
    </span>
  )
}

export default function TourReviewsSlider({ rating, reviews }: TourReviewsSliderProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const syncArrows = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > SCROLL_EPSILON)
    setCanScrollRight(el.scrollLeft < maxScroll - SCROLL_EPSILON)
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const observer = new ResizeObserver(syncArrows)
    observer.observe(el)
    el.addEventListener('scroll', syncArrows, { passive: true })

    return () => {
      observer.disconnect()
      el.removeEventListener('scroll', syncArrows)
    }
  }, [syncArrows])

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector('[data-review-card]')
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8
    el.scrollBy({
      left: step * direction,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }, [])

  return (
    <section className="border-t border-zinc-200 py-8" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="reviews-heading" className="text-xl font-bold text-heading sm:text-2xl">
            Reviews
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-3xl font-bold text-heading">{rating.average.toFixed(1)}</p>
            <RatingStars rating={rating.average} />
            <span className="text-sm text-zinc-500">
              {rating.reviewCount.toLocaleString()} reviews
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
     
          <div className="hidden items-center gap-1.5 sm:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canScrollLeft}
              aria-label="Show previous reviews"
              className="flex size-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-heading shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            >
              <FaChevronLeft className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canScrollRight}
              aria-label="Show more reviews"
              className="flex size-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-heading shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            >
              <FaChevronRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        tabIndex={0}
        role="group"
        aria-label="Tour reviews carousel"
        className="scrollbar-none -mx-1 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-1 pb-1 [-webkit-overflow-scrolling:touch] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        {reviews.list.map((review) => (
          <article
            key={`${review.reviewer}-${review.date}`}
            data-review-card
            className="w-[18rem] shrink-0 snap-start rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:w-[20rem]"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-heading">{review.reviewer}</p>
              <p className="shrink-0 text-xs text-zinc-500">{review.date}</p>
            </div>
            <div className="mt-2">
              <RatingStars rating={review.rating} />
            </div>
            <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-zinc-700">{review.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link
          href={reviews.showMoreHref}
          className="inline-flex rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-heading transition hover:border-primary hover:text-primary"
        >
          {reviews.showMoreLabel}
        </Link>
      </div>
    </section>
  )
}
