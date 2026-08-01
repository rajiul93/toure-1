'use client'

import { PersistentBookingSidebar } from '@/components/booking-layout-context'
import BookingUnavailableNotice from '@/components/booking-unavailable-notice'
import {
  BookingTargetProvider,
  type BokunTarget,
} from '@/components/booking-target-context'
import { tourSlugFromPath } from '@/lib/tour-path'
import { usePathname } from 'next/navigation'
import { useMemo, type ReactNode } from 'react'

/**
 * `/attraction-tours` lists single tours, so the site-wide widget beside it
 * would be selling a fourth, unrelated thing — the home page package. Exact
 * paths only: the tour detail pages below it keep their own booking box.
 */
const PAGES_WITHOUT_BOOKING = new Set(['/about-us', '/attraction-tours'])

function shouldHideBooking(pathname: string): boolean {
  return PAGES_WITHOUT_BOOKING.has(pathname) || pathname.startsWith('/legal/')
}

/**
 * The sidebar sits above every page in the tree, so the per-tour Bokun widget
 * has to be selected here from the URL rather than passed down by the page.
 *
 * A tour missing from `targets` has no experience of its own. It deliberately
 * does NOT inherit the site-wide widget: that widget sells the home page
 * package, so a visitor booking from the tour page would reserve the wrong
 * experience. Those pages get `BookingUnavailableNotice` instead.
 */
function resolveBookingTarget(
  pathname: string,
  targets: Record<string, BokunTarget>,
): BokunTarget | null {
  const slug = tourSlugFromPath(pathname)
  return slug ? (targets[slug] ?? null) : null
}

const SIDEBAR_HOME_CLASS =
  'lg:col-span-2 lg:col-start-5 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-[4.5rem]'

const SIDEBAR_PAGE_CLASS =
  'lg:col-span-2 lg:col-start-5 lg:sticky lg:top-[4.5rem]'

export default function PublicPageShell({
  children,
  bookingTargets = {},
}: {
  children: ReactNode
  bookingTargets?: Record<string, BokunTarget>
}) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const showBooking = !shouldHideBooking(pathname)

  const bookingTarget = resolveBookingTarget(pathname, bookingTargets)
  // A tour page with no experience configured: keep the column, swap the
  // calendar for an explanation rather than selling the wrong tour.
  const bookingInactive = tourSlugFromPath(pathname) !== null && bookingTarget === null

  // On the home page the whole page is about the tour, so the card needs no
  // label. Everywhere else the price is floating without context, and the link
  // is only useful when the visitor is not already on the page it points to.
  const presentation = useMemo(
    () => ({
      showTitle: !isHome,
      showDetailsLink: !isHome && bookingTarget === null,
    }),
    [isHome, bookingTarget],
  )

  return (
    <BookingTargetProvider target={bookingTarget} presentation={presentation}>
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
        {bookingInactive ? <BookingUnavailableNotice /> : <PersistentBookingSidebar />}
      </div>
    </div>
    </BookingTargetProvider>
  )
}
