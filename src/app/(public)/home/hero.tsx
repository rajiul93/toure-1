'use client'

import { useLayoutEffect, useRef } from 'react'
import BookingSidebar from '@/components/booking-sidebar'
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
  const formRef = useRef<HTMLDivElement>(null)
  const bannerBoxRef = useRef<HTMLDivElement>(null)
  const lockedHeightRef = useRef<number | null>(null)
  const expandedRef = useRef(false)

  // Applied imperatively (not via useState) so measuring the form's height
  // never triggers a React re-render — this is pure DOM synchronization.
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
    const el = formRef.current
    if (!el) return
    const h = el.getBoundingClientRect().height
    if (h > 0 && lockedHeightRef.current !== h) {
      lockedHeightRef.current = h
      applyHeight(h)
    }
  }

  // Lock once on mount — never remeasure during open/close (prevents shake)
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

  const handleExpandedChange = (next: boolean) => {
    if (next) {
      if (lockedHeightRef.current == null) lockBannerHeight()
      else applyHeight(lockedHeightRef.current)
    }
    expandedRef.current = next
  }

  return (
    <>
      <HomeHashScroll />
      <div className="grid grid-cols-1 gap-6 py-6 lg:grid-cols-6 lg:items-start">
      <div ref={bannerBoxRef} className="relative lg:col-span-4">
        <div className="h-full">
          <Banner />
        </div>
      </div>

      <BookingSidebar
        ref={formRef}
        className="lg:col-span-2 lg:col-start-5 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-[4.5rem]"
        onExpandedChange={handleExpandedChange}
      />

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
    </div>
    </>
  )
}
