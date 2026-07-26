'use client'

import ReviewFilterChips from '@/components/review-filter-chips'
import ReviewStars from '@/components/review-stars'
import PageHero from '@/components/page-hero'
import { IconStar } from '@/components/icons'
import { LOUVRE_TOUR } from '@/lib/tour-schema'
import {
  FILTER_TAGS,
  RATING_BREAKDOWN,
  REVIEWS,
  type FilterId,
} from '@/lib/reviews-data'
import { useState } from 'react'

export default function ReviewsPageContent() {
  const [activeFilter, setActiveFilter] = useState<FilterId>('all')

  const filteredReviews =
    activeFilter === 'all'
      ? REVIEWS
      : REVIEWS.filter((review) => review.tags.includes(activeFilter))

  return (
    <div>
      <PageHero
        eyebrow="Traveler reviews"
        title="What visitors say about the Louvre experience"
        description="Real feedback on timed entry, the audio guide, and exploring the museum at your own pace — from first-time visitors and repeat travelers."
      >
        <div className="inline-flex flex-wrap items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
          <span className="inline-flex items-center gap-1.5">
            <IconStar className="size-5 text-primary" />
            <span className="text-2xl font-bold tabular-nums">{LOUVRE_TOUR.rating}</span>
            <span className="text-sm text-zinc-300">/ 5</span>
          </span>
          <span className="hidden h-6 w-px bg-white/20 sm:block" aria-hidden="true" />
          <span className="text-sm font-medium text-zinc-200">
            {LOUVRE_TOUR.reviewCountLabel} verified reviews
          </span>
        </div>
      </PageHero>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        <aside className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-heading">Rating breakdown</h2>
          <ul className="mt-4 space-y-2.5">
            {RATING_BREAKDOWN.map((row) => (
              <li key={row.stars} className="flex items-center gap-3 text-sm">
                <span className="w-8 shrink-0 tabular-nums text-zinc-600">{row.stars}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right tabular-nums text-zinc-500">
                  {row.percent}%
                </span>
              </li>
            ))}
          </ul>
        </aside>

        <div>
          <ReviewFilterChips activeFilter={activeFilter} onChange={setActiveFilter} />

          <p className="sr-only" aria-live="polite">
            Showing {filteredReviews.length} review{filteredReviews.length === 1 ? '' : 's'}
          </p>

          <ul className="mt-6 flex flex-col gap-4">
            {filteredReviews.map((review) => (
              <li key={review.id}>
                <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <ReviewStars rating={review.rating} />
                    <time className="text-xs text-zinc-400">{review.date}</time>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-heading">{review.author}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-700">{review.text}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {review.tags
                      .filter((tag) => tag !== 'all')
                      .map((tag) => {
                        const label = FILTER_TAGS.find((item) => item.id === tag)?.label
                        if (!label) return null
                        return (
                          <span
                            key={tag}
                            className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success-dark"
                          >
                            {label}
                          </span>
                        )
                      })}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
