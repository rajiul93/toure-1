'use client'

import { openBookingCalendar } from '@/lib/open-booking'
import { scrollToHomeSection } from '@/lib/home-sections'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentProps } from 'react'

type HomeSectionLinkProps = ComponentProps<typeof Link>

export default function HomeSectionLink({ href, onClick, ...props }: HomeSectionLinkProps) {
  const pathname = usePathname()
  const hrefString = typeof href === 'string' ? href : (href.pathname ?? '')
  const hashMatch = hrefString.match(/#([a-z-]+)/i)
  const sectionId = hashMatch?.[1]

  return (
    <Link
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || pathname !== '/' || !sectionId) return

        event.preventDefault()

        if (sectionId === 'book') {
          openBookingCalendar()
          return
        }

        scrollToHomeSection(sectionId)
      }}
    />
  )
}
