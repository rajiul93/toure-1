'use client'

import { IconChevronDown } from '@/components/icons'
import { useTourConfig } from '@/components/tour-config/tour-config-provider'
import { useId, useRef, useState } from 'react'

function AccordionItem({
  title,
  items,
}: {
  title: string
  items: readonly string[]
}) {
  const [open, setOpen] = useState(false)
  const [height, setHeight] = useState(0)
  const panelId = useId()
  const innerRef = useRef<HTMLDivElement>(null)

  const toggle = () => {
    const el = innerRef.current
    if (!el) return

    if (open) {
      setHeight(el.scrollHeight)
      requestAnimationFrame(() => setHeight(0))
      setOpen(false)
      return
    }

    setOpen(true)
    requestAnimationFrame(() => setHeight(el.scrollHeight))
  }

  return (
    <div className="px-4 py-1 sm:px-5">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-center justify-between gap-3 py-4 text-left text-sm font-semibold text-zinc-900 transition-colors hover:text-secondary sm:text-base"
      >
        {title}
        <span
          className={`flex size-6 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-transform duration-300 ease-in-out motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
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
        style={{ height }}
      >
        <div ref={innerRef}>
          <ul className="space-y-2 pb-4 pl-0 text-sm leading-relaxed text-zinc-600">
            {items.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-zinc-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function TourImportantInfo() {
  const { importantInfo } = useTourConfig()

  return (
    <section
      id="important-info"
      className="scroll-mt-28 border-t border-zinc-200 py-8 lg:py-10"
      aria-labelledby="important-info-heading"
    >
      <h2 id="important-info-heading" className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
        Important information
      </h2>

      <div className="mt-5 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
        {importantInfo.map((section) => (
          <AccordionItem key={section.id} title={section.title} items={section.items} />
        ))}
      </div>
    </section>
  )
}
