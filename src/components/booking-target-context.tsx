'use client'

import { useSiteConfig } from '@/components/site-config/site-config-provider'
import { useTourConfig } from '@/components/tour-config/tour-config-provider'
import { createContext, useContext, useMemo, type ReactNode } from 'react'

/**
 * The booking sidebar is mounted once by the public layout, above every page,
 * so a page cannot pass props to it. Attraction tours need their own Bókun
 * experience — and their own name and price — so the layout resolves a
 * per-route target and provides it here.
 */
export type BokunTarget = {
  channel: string
  experienceId: string
  /** What the widget actually sells, so the card can label itself. */
  title: string
  priceLabel: string
  /** Page describing this experience. */
  detailsHref: string
}

export type BookingPresentation = {
  /** Off the home page the visitor has no other clue what the price refers to. */
  showTitle: boolean
  /** False when the visitor is already on the page the widget describes. */
  showDetailsLink: boolean
}

export type ResolvedBooking = BokunTarget &
  BookingPresentation & {
    loaderUrl: string
    calendarUrl: string
  }

type BookingContextValue = {
  /** Null means "the site-wide widget", i.e. the home page package. */
  target: BokunTarget | null
  presentation: BookingPresentation
}

const DEFAULT_PRESENTATION: BookingPresentation = {
  showTitle: false,
  showDetailsLink: false,
}

const BookingTargetContext = createContext<BookingContextValue | null>(null)

export function BookingTargetProvider({
  target,
  presentation,
  children,
}: {
  target: BokunTarget | null
  presentation: BookingPresentation
  children: ReactNode
}) {
  const value = useMemo(() => ({ target, presentation }), [target, presentation])

  return (
    <BookingTargetContext.Provider value={value}>{children}</BookingTargetContext.Provider>
  )
}

/** Mirrors the URL shapes built in `resolveSiteConfig`. */
export function buildBokunUrls(channel: string, experienceId: string) {
  return {
    loaderUrl: `https://widgets.bokun.io/assets/javascripts/apps/build/BokunWidgetsLoader.js?bookingChannelUUID=${channel}`,
    calendarUrl: `https://widgets.bokun.io/online-sales/${channel}/experience-calendar/${experienceId}`,
  }
}

export function useBookingTarget(): ResolvedBooking {
  const site = useSiteConfig()
  const { louvreTour } = useTourConfig()
  const ctx = useContext(BookingTargetContext)

  const target = ctx?.target ?? null
  const presentation = ctx?.presentation ?? DEFAULT_PRESENTATION

  return useMemo(() => {
    // Both halves are required — a channel without an experience id builds a
    // dead calendar URL, so an incomplete override is ignored entirely.
    if (target?.channel && target.experienceId) {
      return {
        ...target,
        ...presentation,
        ...buildBokunUrls(target.channel, target.experienceId),
      }
    }

    // The site-wide widget sells the home page package, so its name, price and
    // details page all come from tour-config rather than any attraction tour.
    return {
      channel: site.bokun.channel,
      experienceId: site.bokun.experienceId,
      loaderUrl: site.bokun.loaderUrl,
      calendarUrl: site.bokun.calendarUrl,
      title: louvreTour.name,
      priceLabel: louvreTour.priceLabel,
      detailsHref: '/',
      ...presentation,
    }
  }, [target, presentation, site.bokun, louvreTour])
}
