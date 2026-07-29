import type React from 'react'
import type { ResolvedTourConfig } from '@/lib/tour-config.types'


interface TimelineProps {
  className?: string
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl    text-sm leading-7 text-zinc-600     ${className}`}
    >
      {children}
    </div>
  )
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success-dark ${className}`}
    >
      {children}
    </span>
  )
}

export default function TourItinerary({
  louvreTour,
  className = '',
  itineraryStops = [],
}: TimelineProps & {
  louvreTour: ResolvedTourConfig['louvreTour']
  itineraryStops?: ResolvedTourConfig['itineraryStops']
}) {
  // The end marker belongs to the map, not the timeline.
  const timelineStops = itineraryStops.filter((stop) => stop.kind !== 'end')

  return (
    <section
      id="itinerary"
      className={`scroll-mt-28 border-t border-zinc-200 py-8 lg:py-10 ${className}`}
      aria-labelledby="tour-itinerary-heading"
    >
      <Card>
        <h2
          id="tour-itinerary-heading"
          className="mb-2 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl"
        >
          Itinerary
        </h2>
        <p className="mb-8 text-sm text-zinc-500 sm:text-base">
          Self-guided visit · {louvreTour.durationLabel} · Start at the Louvre Pyramid
        </p>

        <ol className="space-y-10">
          {timelineStops.map((item, index) => (
            <li key={item.id} className="group relative transition-all duration-300 hover:translate-x-1">
              {index !== timelineStops.length - 1 ? (
                <div
                  className="absolute left-3 top-8 h-full w-0.5 bg-linear-to-b from-success via-success-muted to-white opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden="true"
                />
              ) : null}

              <div className="flex gap-6">
                <div
                  className="relative z-10 mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-success to-success-hover shadow-md transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                >
                  <div className="size-2.5 rounded-full bg-white shadow-sm" />
                </div>

                <div className="min-w-0 flex-1 space-y-3 transition-colors duration-300 group-hover:text-zinc-900">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-zinc-900 transition-colors duration-300 group-hover:text-success-dark sm:text-lg">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-success">{item.timelineArea}</p>
                      <Badge>{item.duration}</Badge>
                    </div>
                  </div>
                  <p className="-m-3 rounded-lg p-3 leading-relaxed transition-all duration-300 group-hover:bg-success-soft">
                    {item.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </section>
  )
}
