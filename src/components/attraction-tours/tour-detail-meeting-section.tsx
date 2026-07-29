'use client'

import MeetingPointMap from '@/app/(public)/home/meeting-point-map'
import { prepareBlogArticleHtml } from '@/lib/blog-article-html'
import type { ResolvedTourConfig } from '@/lib/tour-config.types'
import { useState } from 'react'

type TourDetailMeetingSectionProps = {
  /** Quill-authored HTML, already sanitized on save. */
  address: string
  /** Shared itinerary, edited at /admin/tour-config. */
  itineraryStops?: ResolvedTourConfig['itineraryStops']
}

export default function TourDetailMeetingSection({
  address,
  // Defaulted so a config missing the field renders an empty section instead
  // of throwing on `itineraryStops[0]`.
  itineraryStops = [],
}: TourDetailMeetingSectionProps) {
  const [activeId, setActiveId] = useState(itineraryStops[0]?.id ?? '')

  return (
    <section className="border-t border-zinc-200 py-8" aria-labelledby="tour-meeting-heading">
      <h2 id="tour-meeting-heading" className="text-xl font-bold text-heading sm:text-2xl">
        Meeting point & itinerary
      </h2>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div>
          <p className="text-sm font-semibold text-heading">{itineraryStops[0]?.title}</p>
          <div
            className="tour-rich-text mt-1"
            dangerouslySetInnerHTML={{ __html: prepareBlogArticleHtml(address) }}
          />

          <ol className="mt-6 space-y-4">
            {itineraryStops.map((stop, index) => (
              <li key={stop.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(stop.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    activeId === stop.id
                      ? 'border-primary bg-primary-soft/40'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-heading">
                    {index + 1}. {stop.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{stop.subtitle}</p>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200">
          <MeetingPointMap stops={itineraryStops} activeId={activeId} />
        </div>
      </div>
    </section>
  )
}
