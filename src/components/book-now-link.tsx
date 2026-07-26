'use client'

import {
  markBookingOpenForNavigation,
  openBookingCalendar,
} from '@/lib/open-booking'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ComponentProps } from 'react'

type BookNowLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href?: string
}

export default function BookNowLink({
  href = '/#book',
  onClick,
  ...props
}: BookNowLinkProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <Link
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return

        event.preventDefault()

        if (document.getElementById('book')) {
          openBookingCalendar()
          window.history.pushState(null, '', `${pathname}#book`)
          return
        }

        markBookingOpenForNavigation()
        router.push('/#book')
      }}
    />
  )
}
