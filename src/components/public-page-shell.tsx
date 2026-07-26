'use client'

import { PersistentBookingSidebar } from '@/components/booking-layout-context'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const PAGES_WITHOUT_BOOKING = new Set(['/about-us'])

const SIDEBAR_HOME_CLASS =
  'lg:col-span-2 lg:col-start-5 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-[4.5rem]'

const SIDEBAR_PAGE_CLASS =
  'lg:col-span-2 lg:col-start-5 lg:sticky lg:top-[4.5rem]'

export default function PublicPageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const showBooking = !PAGES_WITHOUT_BOOKING.has(pathname)

  return (
    <div className="grid grid-cols-1 gap-6 py-6 lg:grid-cols-6 lg:items-start">
      {!showBooking ? (
        <div className="min-w-0 lg:col-span-6">{children}</div>
      ) : isHome ? (
        children
      ) : (
        <div className="min-w-0 lg:col-span-4">{children}</div>
      )}

      {/* Always mounted — grid placement on wrapper, not inner aside */}
      <div
        className={
          !showBooking
            ? 'hidden'
            : isHome
              ? SIDEBAR_HOME_CLASS
              : SIDEBAR_PAGE_CLASS
        }
        aria-hidden={!showBooking}
      >
        <PersistentBookingSidebar />
      </div>
    </div>
  )
}
