'use client'

import TourExperienceCard from '@/components/attraction-tours/tour-experience-card'
import type { AttractionTourCard } from '@/lib/attraction-tour-detail'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'

type TourExperienceRailProps = {
  title: string
  items: AttractionTourCard[]
}

const SCROLL_EPSILON = 2

export default function TourExperienceRail({ title, items }: TourExperienceRailProps) {
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
    const card = el.querySelector('[data-experience-card]')
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8
    el.scrollBy({
      left: step * direction,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }, [])

  if (items.length === 0) return null

  return (
    <section className="border-t border-zinc-200 py-8" aria-label={title}>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl font-bold text-heading sm:text-2xl">{title}</h2>

        <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollLeft}
            aria-label="Show previous tours"
            className="flex size-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-heading shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
          >
            <FaChevronLeft className="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollRight}
            aria-label="Show more tours"
            className="flex size-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-heading shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
          >
            <FaChevronRight className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        tabIndex={0}
        role="group"
        aria-label={`${title} carousel`}
        className="scrollbar-none -mx-1 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-1 pb-1 [-webkit-overflow-scrolling:touch] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        {items.map((item) => (
          <div key={`${title}-${item.slug}`} data-experience-card className="shrink-0">
            <TourExperienceCard item={item} />
          </div>
        ))}
      </div>
    </section>
  )
}
