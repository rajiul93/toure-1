'use client';

import { IconCheck, IconChevronUp, IconX } from '@/components/icons';
import { useBookingTarget } from '@/components/booking-target-context'
import { useSiteConfig } from '@/components/site-config/site-config-provider'
import AvailabilityControl from './availability-control';
import {
  startBokunCalendarWatch,
  type BokunCalendarPhase,
  type BokunFailureCause,
} from '@/lib/bokun-ready';
import {
  BOOKING_OPEN_EVENT,
  openBookingCalendar,
} from '@/lib/open-booking';
import Link from 'next/link';
import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BsWhatsapp } from 'react-icons/bs';
import { FaLock, FaStar } from 'react-icons/fa6';

const DESKTOP_MIN_WIDTH = 1024;

export default function BookingForm({
  onExpandedChange,
}: {
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const site = useSiteConfig();
  const bokun = useBookingTarget();

  const trustBadges = [
    {
      label: site.booking.trustBadges[0].label,
      icon: FaStar,
      className: 'border-primary-muted bg-primary-soft text-primary-dark',
      iconClassName: 'text-primary',
    },
    {
      label: site.booking.trustBadges[1].label,
      icon: FaLock,
      className: 'border-sky-200 bg-sky-50 text-sky-800',
      iconClassName: 'text-sky-600',
    },
  ] as const;

  const features = site.booking.features;
  const [loaderReady, setLoaderReady] = useState(false);
  const [phase, setPhase] = useState<BokunCalendarPhase>('idle');
  const [failure, setFailure] = useState<BokunFailureCause | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const pendingOpenRef = useRef(false);
  const ready = phase === 'ready';

  const setOpen = (next: boolean) => {
    onExpandedChange?.(next);
    setExpanded(next);
  };

  const tryOpenCalendar = useCallback(() => {
    if (ready) {
      onExpandedChange?.(true);
      setExpanded(true);
    } else {
      pendingOpenRef.current = true;
    }
  }, [ready, onExpandedChange]);

  const openFromSticky = () => {
    openBookingCalendar();
  };

  useEffect(() => {
    if (!loaderReady) return;

    const container = widgetRef.current;
    if (!container) return;

    setFailure(null);

    const handle = startBokunCalendarWatch({
      container,
      onPhase: (event) => {
        setPhase(event.phase);
        if (event.phase === 'failed') setFailure(event.cause);
      },
    });

    return () => handle.stop();
    // `bokun.calendarUrl` is a dependency because the keyed widget above is a
    // brand-new element whenever it changes: the old watcher points at a
    // detached node, and the new one needs its own `requestScan()`.
  }, [loaderReady, bokun.calendarUrl]);

  /**
   * A full reload, deliberately. Re-mounting the widget node and re-running
   * Bókun's `initializeBokunWidgets()` does produce a fresh iframe, but that
   * re-initialized embed never posts the messages the calendar normally sends,
   * so it can't be confirmed working — the user would just wait out another
   * timeout. A reload always recovers.
   */
  const retryCalendar = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    if (ready && pendingOpenRef.current) {
      pendingOpenRef.current = false;
      onExpandedChange?.(true);
      setExpanded(true);
    }
  }, [ready, onExpandedChange]);

  useEffect(() => {
    const onOpen = () => tryOpenCalendar();
    window.addEventListener(BOOKING_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(BOOKING_OPEN_EVENT, onOpen);
  }, [tryOpenCalendar]);

  useEffect(() => {
    const cta = ctaRef.current;
    if (!cta) return;

    const desktopQuery = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);

    const updateSticky = (isIntersecting: boolean) => {
      if (desktopQuery.matches || expanded) {
        setShowStickyBar(false);
        return;
      }
      setShowStickyBar(!isIntersecting);
    };

    const observer = new IntersectionObserver(
      ([entry]) => updateSticky(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(cta);

    const onDesktopChange = () => {
      if (desktopQuery.matches) {
        setShowStickyBar(false);
        return;
      }
      const rect = cta.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      updateSticky(inView);
    };

    desktopQuery.addEventListener('change', onDesktopChange);

    return () => {
      observer.disconnect();
      desktopQuery.removeEventListener('change', onDesktopChange);
    };
  }, [expanded]);

  return (
    <>
    <div className="flex flex-col rounded-xl bg-white p-3 shadow ring-1 ring-black/5 sm:p-4">
      <Script
        src={bokun.loaderUrl}
        strategy="lazyOnload"
        onReady={() => setLoaderReady(true)}
        onError={() => {
          setPhase('failed');
          setFailure('loader-error');
        }}
      />

      {!expanded && (
        <>
          <div className="mb-3 flex items-center justify-between gap-2">
            {trustBadges.map((badge) => {
              const BadgeIcon = badge.icon
              return (
                <span
                  key={badge.label}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold shadow-sm ${badge.className}`}
                >
                  <BadgeIcon className={`size-3 shrink-0 ${badge.iconClassName}`} aria-hidden="true" />
                  {badge.label}
                </span>
              )
            })}
          </div>

          {/* Off the home page the price has no context — the visitor could be
              reading a blog post or a review and see a bare "€57 / person". */}
          {bokun.showTitle ? (
            <div className="mb-3 flex items-start justify-between gap-2">
              <p className="text-sm font-bold leading-snug text-heading">{bokun.title}</p>
              {bokun.showDetailsLink ? (
                <Link
                  href={bokun.detailsHref}
                  className="shrink-0 whitespace-nowrap text-xs font-semibold text-primary underline underline-offset-2 transition hover:text-primary-hover"
                >
                  View details
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <p className="leading-none">
              <span className="text-3xl font-bold tracking-tight text-zinc-900">
                {bokun.priceLabel}
              </span>
              <span className="ml-1 text-sm text-zinc-500">/ person</span>
            </p>
            <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">
              Ticket + Audio Guide
            </span>
          </div>

          <ul className="mb-4 flex flex-nowrap gap-1">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex min-w-0 flex-1 items-center gap-0.5 rounded-full bg-emerald-50 px-1 py-1 text-[10px] font-medium leading-tight text-emerald-700 sm:gap-1 sm:px-1.5 sm:text-xs"
              >
                <IconCheck className="size-2.5 shrink-0 sm:size-3" />
                <span className="min-w-0 truncate">{feature}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div ref={ctaRef} className="relative space-y-2">
        {expanded ? (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="relative z-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-heading px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-heading/90"
            aria-expanded={true}
          >
            <IconX className="size-4" />
            Close availability
            <IconChevronUp className="size-4" />
          </button>
        ) : (
          <AvailabilityControl
            phase={phase}
            failure={failure}
            announce
            onOpen={() => setOpen(true)}
            onRetry={retryCalendar}
          />
        )}

        {/* Preloads at real size while collapsed — clipped rather than moved
            off-screen, so the iframe keeps painting at its normal position. */}
        <div
          className={
            expanded
              ? 'relative z-0 max-h-[min(70vh,640px)] overflow-y-auto overscroll-contain opacity-100 [clip-path:none] [-webkit-clip-path:none]'
              : 'pointer-events-none absolute left-0 right-0 top-0 z-0 h-[min(640px,70vh)] overflow-hidden opacity-0 [clip-path:inset(0_0_100%_0)] [-webkit-clip-path:inset(0_0_100%_0)]'
          }
          aria-hidden={!expanded}
          inert={!expanded}
        >
          {/* Keyed on the calendar URL. Bókun hydrates this node into an
              iframe and will not re-hydrate an element it has already
              processed, so without a remount a client-side navigation between
              two tours would leave the previous tour's calendar in place while
              `data-src` silently pointed at the new one — a visitor could book
              the wrong experience. The key forces a fresh, unhydrated node. */}
          <div
            key={bokun.calendarUrl}
            ref={widgetRef}
            className="bokunWidget min-h-[320px]"
            data-src={bokun.calendarUrl}
          />
        </div>
      </div>

      <a
        href={site.contact.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-success px-4 py-3 text-sm font-semibold text-success-foreground shadow-sm transition hover:bg-success-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2"
      >
        <BsWhatsapp className="whatsapp-blink size-4 shrink-0" aria-hidden="true" />
        {site.contact.whatsappCtaLabel}
      </a>

      <noscript>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Please enable javascript in your browser to book
        </p>
      </noscript>
    </div>

    {showStickyBar ? (
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/80 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden"
        role="region"
        aria-label="Quick booking"
      >
        <div className="flex gap-2">
          <a
            href={site.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-success text-success-foreground shadow-sm transition hover:bg-success-hover"
            aria-label="Chat on WhatsApp"
          >
            <BsWhatsapp className="size-5" aria-hidden="true" />
          </a>
          <div className="min-w-0 flex-1">
            <AvailabilityControl
              phase={phase}
              failure={failure}
              compact
              onOpen={openFromSticky}
              onRetry={retryCalendar}
            />
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
