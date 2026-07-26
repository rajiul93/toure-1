'use client'

import { IconChevronDown, IconChevronUp } from '@/components/icons'
import { useId, useState } from 'react'

const HIGHLIGHTS = [
  'Skip the main ticket line with a reserved timed-entry slot',
  'Explore the Denon, Sully, and Richelieu wings at your own pace',
  'See the Mona Lisa, Venus de Milo, and Winged Victory of Samothrace',
  'Multilingual audio guide included on your phone',
] as const

const DESCRIPTION = `Step inside the world's most visited museum with a reserved timed-entry ticket and a flexible audio guide. Your visit starts at the iconic Louvre Pyramid, where you'll enter through a dedicated time slot and avoid the longest general-admission queues.

Once inside, follow the audio guide through the museum's greatest masterpieces — from Italian Renaissance rooms to ancient Egyptian treasures. The route is designed for first-time visitors who want the highlights without feeling rushed, with plenty of time to pause, photograph, and explore side galleries on your own.`

export default function TourOverview() {
  const [expanded, setExpanded] = useState(false)
  const descriptionId = useId()

  return (
    <section
      id="overview"
      className="scroll-mt-28 border-t border-zinc-200 py-8 lg:py-10"
      aria-labelledby="overview-heading"
    >
      <h2 id="overview-heading" className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
        Overview
      </h2>

      <div className="mt-5">
        <p
          id={descriptionId}
          className={`text-sm leading-relaxed text-zinc-700 sm:text-base ${expanded ? '' : 'line-clamp-4'}`}
        >
          {DESCRIPTION}
        </p>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-controls={descriptionId}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {expanded ? (
            <>
              <IconChevronUp className="size-3.5" />
              Read less
            </>
          ) : (
            <>
              <IconChevronDown className="size-3.5" />
              Read more
            </>
          )}
        </button>
      </div>

      <div className="mt-8">
        <h3 className="text-base font-semibold text-zinc-900 sm:text-lg">Highlights</h3>
        <ul className="mt-3 space-y-2.5">
          {HIGHLIGHTS.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-zinc-700 sm:text-base">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
