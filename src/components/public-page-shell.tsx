'use client'

import BookingSidebar from '@/components/booking-sidebar'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const PAGES_WITHOUT_BOOKING = new Set(['/about-us'])

export default function PublicPageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/' || PAGES_WITHOUT_BOOKING.has(pathname)) {
    return <div className="py-6">{children}</div>
  }

  return (
    <div className="grid grid-cols-1 gap-6 py-6 lg:grid-cols-6 lg:items-start">
      <div className="min-w-0 lg:col-span-4">{children}</div>
      <BookingSidebar className="lg:col-span-2 lg:col-start-5 lg:sticky lg:top-[4.5rem]" />
    </div>
  )
}
