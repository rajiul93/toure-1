'use client'

import { HOME_SECTIONS, scrollToHomeSection } from '@/lib/home-sections'
import { useEffect, useState } from 'react'

export default function HomeSectionNav() {
  const [activeId, setActiveId] = useState<string>(HOME_SECTIONS[0].id)

  useEffect(() => {
    const elements = HOME_SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (element): element is HTMLElement => element != null,
    )

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        const nextId = visible[0]?.target.id
        if (nextId) setActiveId(nextId)
      },
      {
        rootMargin: '-112px 0px -55% 0px',
        threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
      },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return (
    <nav
      className="sticky top-14 z-30 -mx-4 border-b border-zinc-200/80 bg-white/90 px-4 py-2 backdrop-blur-md sm:top-16"
      aria-label="Page sections"
    >
      <ul className="flex gap-0.5 overflow-x-auto scrollbar-none">
        {HOME_SECTIONS.map((section) => {
          const active = activeId === section.id

          return (
            <li key={section.id} className="shrink-0">
              <button
                type="button"
                onClick={() => scrollToHomeSection(section.id)}
                aria-current={active ? 'location' : undefined}
                className={`relative rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm ${
                  active
                    ? 'font-semibold text-heading'
                    : 'text-zinc-600 hover:text-heading'
                }`}
              >
                {section.label}
                {active ? (
                  <span
                    className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary"
                    aria-hidden
                  />
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
