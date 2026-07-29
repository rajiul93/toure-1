'use client'

import { IconChevronDown } from '@/components/icons'
import type {
  AttractionTourDetail,
  AttractionTourInfoSection,
} from '@/lib/attraction-tour-detail'
import { prepareBlogArticleHtml } from '@/lib/blog-article-html'
import { useId, useRef, useState } from 'react'

type TourImportantInformationSectionProps = {
  sections: AttractionTourDetail['importantInformation']
}

/**
 * Inclusion/exclusion keep their green-check and red-cross bullets. The body is
 * now free-form Quill HTML, so the marker is drawn in CSS off this modifier
 * class instead of a React icon per item.
 */
function variantClass(id: string): string {
  if (id === 'inclusion') return 'tour-rich-text--included'
  if (id === 'exclusion') return 'tour-rich-text--excluded'
  return ''
}

function InfoBody({ section }: { section: AttractionTourInfoSection }) {
  return (
    <div
      className={`tour-rich-text ${variantClass(section.id)}`}
      dangerouslySetInnerHTML={{ __html: prepareBlogArticleHtml(section.html) }}
    />
  )
}

function AccordionSubsection({ section }: { section: AttractionTourInfoSection }) {
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
        className="flex w-full cursor-pointer items-center justify-between gap-3 py-4 text-left text-sm font-semibold text-heading transition-colors hover:text-primary sm:text-base"
      >
        {section.title}
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
        <div ref={innerRef} className="pb-4">
          <InfoBody section={section} />
        </div>
      </div>
    </div>
  )
}

function DesktopSubsection({
  section,
  className,
}: {
  section: AttractionTourInfoSection
  className?: string
}) {
  return (
    <div className={className}>
      <h3 className="text-sm font-bold uppercase tracking-wide text-heading">{section.title}</h3>
      <div className="mt-3">
        <InfoBody section={section} />
      </div>
    </div>
  )
}

export default function TourImportantInformationSection({
  sections: inputSections,
}: TourImportantInformationSectionProps) {
  const sections = inputSections.filter((section) => section.html.trim() !== '')
  if (sections.length === 0) return null

  const inclusion = sections.find((section) => section.id === 'inclusion')
  const exclusion = sections.find((section) => section.id === 'exclusion')
  const otherSections = sections.filter(
    (section) => section.id !== 'inclusion' && section.id !== 'exclusion',
  )
  const hasPair = Boolean(inclusion && exclusion)

  return (
    <section
      className="border-t border-zinc-200 py-8 lg:py-10"
      aria-labelledby="important-information-heading"
    >
      <h2 id="important-information-heading" className="text-xl font-bold text-heading sm:text-2xl">
        Important information
      </h2>

      {/* Mobile: compact accordion so long lists stay scannable */}
      <div className="mt-5 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white lg:hidden">
        {sections.map((section) => (
          <AccordionSubsection key={section.id} section={section} />
        ))}
      </div>

      {/* Desktop: all sections visible — inclusion/exclusion side by side */}
      <div className="mt-5 hidden divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white lg:block">
        {hasPair ? (
          <div className="grid grid-cols-2 divide-x divide-zinc-200">
            <DesktopSubsection section={inclusion!} className="px-6 py-6" />
            <DesktopSubsection section={exclusion!} className="px-6 py-6" />
          </div>
        ) : null}

        {!hasPair && inclusion ? (
          <DesktopSubsection section={inclusion} className="px-6 py-6" />
        ) : null}

        {!hasPair && exclusion ? (
          <DesktopSubsection section={exclusion} className="px-6 py-6" />
        ) : null}

        {otherSections.map((section) => (
          <DesktopSubsection key={section.id} section={section} className="px-6 py-6" />
        ))}
      </div>
    </section>
  )
}
