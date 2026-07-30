'use client'

import { useSiteConfig } from '@/components/site-config/site-config-provider'
import { BsWhatsapp } from 'react-icons/bs'
import { FaRegCalendarXmark } from 'react-icons/fa6'

/**
 * Shown in place of the booking widget when a tour has no Bókun experience of
 * its own.
 *
 * The alternative — falling back to the site-wide widget — silently sells a
 * DIFFERENT experience than the page the visitor is reading, so it is better to
 * offer no calendar at all than the wrong one. WhatsApp stays available so the
 * enquiry is not simply lost.
 */
export default function BookingUnavailableNotice({ className }: { className?: string }) {
  const site = useSiteConfig()

  return (
    <aside
      id="book"
      className={`scroll-mt-28 ${className ?? ''}`}
      aria-label="Booking availability"
    >
      <div className="flex flex-col rounded-xl bg-white p-4 shadow ring-1 ring-black/5">
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500"
            aria-hidden="true"
          >
            <FaRegCalendarXmark className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-heading">Online booking not active</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600">
              This tour can&apos;t be booked online at the moment. Message us and we&apos;ll
              check availability and hold your place.
            </p>
          </div>
        </div>

        {site.contact.whatsappUrl ? (
          <a
            href={site.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-success px-4 py-3 text-sm font-semibold text-success-foreground shadow-sm transition hover:bg-success-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2"
          >
            <BsWhatsapp className="size-4 shrink-0" aria-hidden="true" />
            {site.contact.whatsappCtaLabel}
          </a>
        ) : null}
      </div>
    </aside>
  )
}
