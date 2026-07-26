'use client'

import { useLayoutEffect, useRef, useCallback } from 'react'
import { useBookingExpandedHandler } from '@/components/booking-layout-context'
import HomeHashScroll from '@/components/home-hash-scroll'
import HomeSectionNav from '@/components/home-section-nav'
import Banner from './banner'
import ProductIntro from './product-intro'
import TourFaq from './tour-faq'
import TourImportantInfo from './tour-important-info'
import TourInclusions from './tour-inclusions'
import TourItinerary from './tour-itinerary'
import TourMeetingPoint from './tour-meeting-point'
import TourOverview from './tour-overview'
import TravelerReviews from './traveler-reviews'

const DESKTOP_MIN_WIDTH = 1024 // Tailwind `lg` breakpoint

export default function Hero() {
  const bannerBoxRef = useRef<HTMLDivElement>(null)
  const lockedHeightRef = useRef<number | null>(null)
  const expandedRef = useRef(false)

  const applyHeight = (px: number | null) => {
    const el = bannerBoxRef.current
    if (!el) return
    el.style.height = px != null ? `${px}px` : ''
  }

  const lockBannerHeight = () => {
    if (expandedRef.current) return
    if (window.innerWidth < DESKTOP_MIN_WIDTH) {
      lockedHeightRef.current = null
      applyHeight(null)
      return
    }
    const el = document.getElementById('book')
    if (!el) return
    const h = el.getBoundingClientRect().height
    if (h > 0 && lockedHeightRef.current !== h) {
      lockedHeightRef.current = h
      applyHeight(h)
    }
  }

  const handleExpandedChange = useCallback((next: boolean) => {
    if (next) {
      if (lockedHeightRef.current == null) {
        if (window.innerWidth >= DESKTOP_MIN_WIDTH) {
          const el = document.getElementById('book')
          if (el) {
            const h = el.getBoundingClientRect().height
            if (h > 0) {
              lockedHeightRef.current = h
              applyHeight(h)
            }
          }
        }
      } else {
        applyHeight(lockedHeightRef.current)
      }
    }
    expandedRef.current = next
  }, [])

  useBookingExpandedHandler(handleExpandedChange)

  useLayoutEffect(() => {
    lockBannerHeight()
    const id = window.setTimeout(lockBannerHeight, 150)

    const onResize = () => {
      if (window.innerWidth < DESKTOP_MIN_WIDTH) {
        lockedHeightRef.current = null
        applyHeight(null)
        return
      }
      if (!expandedRef.current) {
        lockedHeightRef.current = null
        lockBannerHeight()
      }
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.clearTimeout(id)
      window.removeEventListener('resize', onResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only lock
  }, [])

  return (
    <>
      <HomeHashScroll />
      <div ref={bannerBoxRef} className="relative lg:col-span-4">
        <div className="h-full">
          <Banner />
        </div>
      </div>

      <div className="flex flex-col lg:col-span-4">
        <HomeSectionNav />
        <ProductIntro />
        <TourOverview />
        <TourInclusions />
        <TourItinerary />
        <TourMeetingPoint />
        <TourImportantInfo />
        <TourFaq />
        <TravelerReviews />
      </div>
    </>
  )
}
