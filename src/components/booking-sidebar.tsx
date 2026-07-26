'use client'

import BookingForm from '@/app/(public)/home/booking-form'
import { forwardRef } from 'react'

type BookingSidebarProps = {
  className?: string
  onExpandedChange?: (expanded: boolean) => void
}

const BookingSidebar = forwardRef<HTMLElement, BookingSidebarProps>(
  function BookingSidebar({ className, onExpandedChange }, ref) {
    return (
      <aside
        id="book"
        ref={ref}
        className={`scroll-mt-28 ${className ?? ''}`}
      >
        <BookingForm onExpandedChange={onExpandedChange} />
      </aside>
    )
  },
)

export default BookingSidebar
