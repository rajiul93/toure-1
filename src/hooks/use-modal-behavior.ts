'use client'

import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/** Locks body scroll, restoring whatever value was there before. */
export function lockBodyScroll(): () => void {
  const previous = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  // Restore the previous value rather than clearing it — two overlays can be
  // open at once (e.g. photo lightbox + mobile drawer), and blindly setting ''
  // on close destroys the other one's lock.
  return () => {
    document.body.style.overflow = previous
  }
}

type ModalBehaviorOptions = {
  open: boolean
  containerRef: RefObject<HTMLElement | null>
  onClose: () => void
  /** Set false for overlays that should not take focus (e.g. a nav drawer). */
  trapFocus?: boolean
  lockScroll?: boolean
}

/**
 * Escape-to-close, focus trap, focus restore and body scroll lock for a modal
 * overlay. Without this a keyboard user stays focused on the page behind an
 * `aria-modal` dialog and can tab straight through it.
 */
export function useModalBehavior({
  open,
  containerRef,
  onClose,
  trapFocus = true,
  lockScroll = true,
}: ModalBehaviorOptions) {
  // Kept in a ref so an inline `onClose={() => …}` doesn't re-run the focus and
  // scroll-lock effect on every render. Assigned in an effect, never during
  // render (see the `react-hooks/refs` rule).
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const container = containerRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null
    const releaseScroll = lockScroll ? lockBodyScroll() : null

    const focusables = () =>
      container
        ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
            (el) => el.offsetParent !== null || el === document.activeElement,
          )
        : []

    if (trapFocus && container) {
      // Prefer a real control; fall back to the container itself so focus at
      // least enters the dialog.
      const first = focusables()[0]
      if (first) first.focus()
      else {
        container.setAttribute('tabindex', '-1')
        container.focus()
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
        return
      }

      if (!trapFocus || event.key !== 'Tab' || !container) return

      const items = focusables()
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || !container.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      releaseScroll?.()
      // Return focus to whatever opened the dialog, otherwise Tab restarts
      // from the top of the document.
      if (trapFocus && previouslyFocused?.isConnected) previouslyFocused.focus()
    }
  }, [open, containerRef, trapFocus, lockScroll])
}
