'use client'

import { consumeBookingOpenFlag, openBookingCalendar } from '@/lib/open-booking'
import { scrollToHomeHash } from '@/lib/home-sections'
import { useEffect } from 'react'

export default function HomeHashScroll() {
  useEffect(() => {
    const run = () => {
      const hash = window.location.hash

      if (hash === '#book' || consumeBookingOpenFlag()) {
        openBookingCalendar()
        return
      }

      if (hash) scrollToHomeHash(hash)
    }

    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(run)
    })

    const onHashChange = () => {
      if (window.location.hash === '#book') {
        openBookingCalendar()
        return
      }
      scrollToHomeHash(window.location.hash)
    }

    window.addEventListener('hashchange', onHashChange)
    return () => {
      window.cancelAnimationFrame(id)
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])

  return null
}
