import { HOME_SCROLL_OFFSET } from '@/lib/home-sections'

export const BOOKING_OPEN_EVENT = 'daytour:open-booking'
export const BOOKING_OPEN_STORAGE_KEY = 'daytour:open-booking'

/**
 * Whether the booking sidebar is actually on screen.
 *
 * The sidebar stays mounted on every public route so the Bókun iframe survives
 * navigation, but it is hidden with `display:none` on pages that can't book
 * (see `public-page-shell.tsx`). A plain `getElementById` therefore finds it
 * even where it is invisible, so callers must check visibility instead of mere
 * existence — otherwise "Book now" scrolls to a zero-height element and never
 * navigates home.
 */
export function getVisibleBookingTarget(): HTMLElement | null {
  const el = document.getElementById('book')
  if (!el) return null
  // `offsetParent` is null for a `display:none` subtree. The rect check covers
  // `position: fixed` elements, where offsetParent is null even when visible.
  const hidden = el.offsetParent === null && el.getClientRects().length === 0
  return hidden ? null : el
}

export function openBookingCalendar() {
  const el = getVisibleBookingTarget()
  if (!el) return

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const top = el.getBoundingClientRect().top + window.scrollY - HOME_SCROLL_OFFSET

  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReduced ? 'auto' : 'smooth',
  })
  window.dispatchEvent(new CustomEvent(BOOKING_OPEN_EVENT))
}

export function markBookingOpenForNavigation() {
  sessionStorage.setItem(BOOKING_OPEN_STORAGE_KEY, '1')
}

export function consumeBookingOpenFlag() {
  if (sessionStorage.getItem(BOOKING_OPEN_STORAGE_KEY) !== '1') return false
  sessionStorage.removeItem(BOOKING_OPEN_STORAGE_KEY)
  return true
}
