import { HOME_SCROLL_OFFSET } from '@/lib/home-sections'

export const BOOKING_OPEN_EVENT = 'daytour:open-booking'
export const BOOKING_OPEN_STORAGE_KEY = 'daytour:open-booking'

export function openBookingCalendar() {
  const el = document.getElementById('book')
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
