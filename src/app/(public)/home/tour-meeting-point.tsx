'use client'

import { IconChevronDown, IconExternalLink } from '@/components/icons'
import { ITINERARY_STOPS, type ItineraryStop } from '@/lib/itinerary-stops'
import { useEffect, useId, useRef, useState } from 'react'
import { FaFlagCheckered, FaLocationDot } from 'react-icons/fa6'
import MeetingPointMap from './meeting-point-map'

function StopIcon({ stop, active }: { stop: ItineraryStop; active: boolean }) {
  if (stop.kind === 'meeting') {
    return (
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-success text-white shadow-md ${active ? 'ring-2 ring-primary ring-offset-2' : ''}`}
        aria-hidden
      >
        <FaLocationDot className="size-4" />
      </span>
    )
  }

  if (stop.kind === 'end') {
    return (
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-success text-white shadow-md ${active ? 'ring-2 ring-primary ring-offset-2' : ''}`}
        aria-hidden
      >
        <FaFlagCheckered className="size-3.5" />
      </span>
    )
  }

  return (
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-zinc-900 text-sm font-bold text-white shadow-md ${active ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      aria-hidden
    >
      {stop.number}
    </span>
  )
}

function ItineraryAccordionItem({
  stop,
  active,
  open,
  isLast,
  onSelect,
}: {
  stop: ItineraryStop
  active: boolean
  open: boolean
  isLast: boolean
  onSelect: () => void
}) {
  const panelId = useId()
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return

    if (open) {
      requestAnimationFrame(() => setHeight(el.scrollHeight))
      return
    }

    setHeight(el.scrollHeight)
    requestAnimationFrame(() => setHeight(0))
  }, [open])

  return (
    <li className="relative flex gap-3 pb-1">
      {!isLast ? (
        <div
          className="absolute left-4 top-9 bottom-0 w-0.5 -translate-x-1/2 bg-zinc-900"
          aria-hidden
        />
      ) : null}

      <div className="relative z-10 pt-0.5">
        <StopIcon stop={stop} active={active} />
      </div>

      <div className="min-w-0 flex-1 border-b border-zinc-200 pb-4 last:border-b-0">
        <button
          type="button"
          onClick={onSelect}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full cursor-pointer items-start justify-between gap-3 text-left"
        >
          <span className="min-w-0 space-y-0.5">
            <span className="block text-sm font-semibold text-zinc-900 sm:text-base">
              {stop.title}
            </span>
            <span className="block text-xs text-zinc-500 sm:text-sm">{stop.subtitle}</span>
          </span>
          <span
            className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-transform duration-300 ease-in-out motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
            aria-hidden
          >
            <IconChevronDown className="size-4" />
          </span>
        </button>

        <div
          id={panelId}
          role="region"
          aria-hidden={!open}
          className="overflow-hidden transition-[height] duration-300 ease-in-out motion-reduce:transition-none"
          style={{ height: open ? height : 0 }}
        >
          <div ref={innerRef} className="pt-3">
            {stop.address ? (
              <p className="text-sm leading-relaxed text-zinc-600">{stop.address}</p>
            ) : null}
            <a
              href={stop.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 hover:text-primary"
            >
              Open in Google Maps
              <IconExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </li>
  )
}

export default function TourMeetingPoint() {
  const [activeId, setActiveId] = useState(ITINERARY_STOPS[0].id)
  const [openId, setOpenId] = useState<string | null>(ITINERARY_STOPS[ITINERARY_STOPS.length - 1].id)

  const handleSelect = (id: string) => {
    setActiveId(id)
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <section
      id="meeting-point"
      className="scroll-mt-28 border-t border-zinc-200 py-8 lg:py-10"
      aria-labelledby="meeting-point-heading"
    >
      <h2
        id="meeting-point-heading"
        className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl"
      >
        Meeting Point &amp; Itinerary
      </h2>

      <div className="mt-5 grid gap-5 lg:grid-cols-2 lg:items-stretch">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 ">
          <ul className="p-4 sm:p-5">
            {ITINERARY_STOPS.map((stop, index) => (
              <ItineraryAccordionItem
                key={stop.id}
                stop={stop}
                active={activeId === stop.id}
                open={openId === stop.id}
                isLast={index === ITINERARY_STOPS.length - 1}
                onSelect={() => handleSelect(stop.id)}
              />
            ))}
          </ul>
        </div>

        <div className="relative isolate z-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <MeetingPointMap stops={ITINERARY_STOPS} activeId={activeId} />
        </div>
      </div>
    </section>
  )
}
