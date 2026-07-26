'use client'

import BookingSidebar from '@/components/booking-sidebar'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from 'react'

type ExpandedHandler = (expanded: boolean) => void

type BookingLayoutContextValue = {
  registerExpandedHandler: (handler: ExpandedHandler | null) => void
  notifyExpandedChange: ExpandedHandler
}

const BookingLayoutContext = createContext<BookingLayoutContextValue | null>(null)

const expandedHandlerRef: { current: ExpandedHandler | null } = { current: null }

export function BookingLayoutProvider({ children }: { children: ReactNode }) {
  const registerExpandedHandler = useCallback((handler: ExpandedHandler | null) => {
    expandedHandlerRef.current = handler
  }, [])

  const notifyExpandedChange = useCallback((expanded: boolean) => {
    expandedHandlerRef.current?.(expanded)
  }, [])

  return (
    <BookingLayoutContext.Provider
      value={{ registerExpandedHandler, notifyExpandedChange }}
    >
      {children}
    </BookingLayoutContext.Provider>
  )
}

export function useBookingExpandedHandler(handler: ExpandedHandler | null) {
  const ctx = useContext(BookingLayoutContext)

  useEffect(() => {
    if (!ctx) return
    ctx.registerExpandedHandler(handler)
    return () => ctx.registerExpandedHandler(null)
  }, [ctx, handler])
}

export function PersistentBookingSidebar({ className }: { className?: string }) {
  const ctx = useContext(BookingLayoutContext)

  if (!ctx) {
    return <BookingSidebar className={className} />
  }

  return (
    <BookingSidebar
      className={className}
      onExpandedChange={ctx.notifyExpandedChange}
    />
  )
}
