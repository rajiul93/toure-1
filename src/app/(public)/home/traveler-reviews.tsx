'use client'

import {
  IconChevronLeft,
  IconChevronRight,
  IconStar,
} from '@/components/icons'
import ReviewFilterChips from '@/components/review-filter-chips'
import ReviewStars from '@/components/review-stars'
import { useTourConfig } from '@/components/tour-config/tour-config-provider'
import { FILTER_TAGS, REVIEWS, type FilterId } from '@/lib/reviews-data'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

function ScrollButton({
  direction,
  onClick,
  className,
}: {
  direction: 'left' | 'right'
  onClick: () => void
  className?: string
}) {
  const Icon = direction === 'left' ? IconChevronLeft : IconChevronRight

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'left' ? 'Scroll left' : 'Scroll right'}
      className={`absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-md transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className ?? ''}`}
    >
      <Icon className="size-4" />
    </button>
  )
}

function useScrollEdges(
  ref: React.RefObject<HTMLDivElement | null>,
  deps: readonly unknown[] = [],
) {
  const [edges, setEdges] = useState({ left: false, right: false })

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return

    const maxScroll = el.scrollWidth - el.clientWidth
    setEdges({
      left: el.scrollLeft > 4,
      right: maxScroll > 4 && el.scrollLeft < maxScroll - 4,
    })
  }, [ref])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    update()
    el.addEventListener('scroll', update, { passive: true })

    const resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(el)
    window.addEventListener('resize', update)

    return () => {
      el.removeEventListener('scroll', update)
      resizeObserver.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [update, ...deps])

  return edges
}

export default function TravelerReviews() {
  const { louvreTour } = useTourConfig()
  const rating = louvreTour.rating
  const reviewCount = louvreTour.reviewCountLabel
  const [activeFilter, setActiveFilter] = useState<FilterId>('all')
  const chipScrollRef = useRef<HTMLDivElement>(null)
  const cardScrollRef = useRef<HTMLDivElement>(null)

  const filteredReviews =
    activeFilter === 'all'
      ? REVIEWS
      : REVIEWS.filter((review) => review.tags.includes(activeFilter))

  const chipEdges = useScrollEdges(chipScrollRef)
  const cardEdges = useScrollEdges(cardScrollRef, [activeFilter, filteredReviews.length])

  useEffect(() => {
    cardScrollRef.current?.scrollTo({ left: 0 })
  }, [activeFilter])

  const scrollBy = (ref: React.RefObject<HTMLDivElement | null>, amount: number) => {
    ref.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <section id="reviews" className="scroll-mt-28 border-t border-zinc-200 py-8 lg:py-10" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="reviews-heading" className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
          Why travelers loved this
        </h2>

        <div className="flex items-center gap-2 text-sm sm:text-base">
          <span className="inline-flex items-center gap-1.5" aria-label={`Rated ${rating} out of 5 stars`}>
            <IconStar className="size-5 text-primary" />
            <span className="font-bold text-zinc-900">{rating}</span>
          </span>
          <span className="text-zinc-400" aria-hidden="true">
            •
          </span>
          <span className="font-medium text-zinc-900 underline underline-offset-2">
            <Link href="/reviews" className="hover:text-primary">
              {reviewCount} Reviews
            </Link>
          </span>
        </div>
      </div>

      <div className="relative mt-5">
        {chipEdges.left ? (
          <ScrollButton
            direction="left"
            onClick={() => scrollBy(chipScrollRef, -220)}
            className="left-0"
          />
        ) : null}

        <div
          ref={chipScrollRef}
          className={`scrollbar-none overscroll-x-contain [-webkit-overflow-scrolling:touch] ${chipEdges.left ? 'pl-10' : ''} ${chipEdges.right ? 'pr-10' : ''}`}
        >
          <ReviewFilterChips
            activeFilter={activeFilter}
            onChange={setActiveFilter}
            layout="scroll"
          />
        </div>

        {chipEdges.right ? (
          <ScrollButton
            direction="right"
            onClick={() => scrollBy(chipScrollRef, 220)}
            className="right-0"
          />
        ) : null}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Showing {filteredReviews.length} review{filteredReviews.length === 1 ? '' : 's'}
        {activeFilter === 'all' ? '' : ` for ${FILTER_TAGS.find((tag) => tag.id === activeFilter)?.label}`}
      </p>

      <div className="relative mt-5">
        {cardEdges.left ? (
          <ScrollButton
            direction="left"
            onClick={() => scrollBy(cardScrollRef, -340)}
            className="left-0"
          />
        ) : null}

        <div
          ref={cardScrollRef}
          role="list"
          aria-label="Traveler reviews"
          className={`scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] ${cardEdges.left ? 'pl-10' : ''} ${cardEdges.right ? 'pr-10' : ''}`}
        >
          {filteredReviews.length === 0 ? (
            <p className="py-8 text-sm text-zinc-500" role="status">
              No reviews match this filter yet.
            </p>
          ) : (
            filteredReviews.map((review) => (
              <article
                key={review.id}
                role="listitem"
                className="w-[min(100%,320px)] shrink-0 snap-start rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:w-[320px]"
              >
                <ReviewStars rating={review.rating} />

                <p className="mt-3 text-sm text-zinc-500">
                  <span className="font-medium text-zinc-700">{review.author}</span>
                  <span aria-hidden="true"> • </span>
                  <time>{review.date}</time>
                </p>

                <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-zinc-800">
                  {review.text}
                </p>

                <Link
                  href="/reviews"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  See all reviews
                </Link>
              </article>
            ))
          )}
        </div>

        {cardEdges.right ? (
          <ScrollButton
            direction="right"
            onClick={() => scrollBy(cardScrollRef, 340)}
            className="right-0"
          />
        ) : null}
      </div>
    </section>
  )
}
