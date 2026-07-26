'use client';

import {
  IconCheck,
  IconChevronUp,
  IconSpinner,
  IconX,
} from '@/components/icons';
import { LOUVRE_TOUR } from '@/lib/tour-schema';
import { SITE } from '@/lib/site-config';
import {
  BOOKING_OPEN_EVENT,
  openBookingCalendar,
} from '@/lib/open-booking';
import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BsWhatsapp } from 'react-icons/bs';
import { FaCalendarDays, FaLock, FaStar } from 'react-icons/fa6';

const DESKTOP_MIN_WIDTH = 1024;
const CALENDAR_MIN_IFRAME_HEIGHT = 260;
const CALENDAR_STABLE_MS = 700;
const CALENDAR_POLL_MS = 150;

type BokunWindow = Window & {
  BokunWidgetsLoader?: {
    loadWidgets?: () => void;
    init?: () => void;
  };
};

function requestBokunWidgetScan() {
  const loader = (window as BokunWindow).BokunWidgetsLoader;
  loader?.loadWidgets?.();
  loader?.init?.();
}

function getCalendarIframe(container: HTMLElement) {
  return container.querySelector('iframe');
}

function waitForStableCalendar(
  widget: HTMLElement,
  onReady: () => void,
  isCancelled: () => boolean,
) {
  let lastHeight = 0;
  let stableSince = 0;
  let iframeLoaded = false;

  const finishIfStable = () => {
    const iframe = getCalendarIframe(widget);
    if (!iframe) return;

    if (
      !iframeLoaded &&
      iframe.getAttribute('src') &&
      iframe.offsetHeight >= CALENDAR_MIN_IFRAME_HEIGHT
    ) {
      iframeLoaded = true;
    }

    if (!iframeLoaded) return;

    const height = iframe.offsetHeight;
    const now = performance.now();

    if (height < CALENDAR_MIN_IFRAME_HEIGHT) {
      lastHeight = 0;
      stableSince = 0;
      return;
    }

    if (height === lastHeight) {
      if (stableSince === 0) stableSince = now;
      if (now - stableSince >= CALENDAR_STABLE_MS) {
        onReady();
      }
      return;
    }

    lastHeight = height;
    stableSince = 0;
  };

  const attachIframeLoad = (iframe: HTMLIFrameElement) => {
    if (iframe.dataset.preloadBound === '1') return;
    iframe.dataset.preloadBound = '1';

    iframe.addEventListener(
      'load',
      () => {
        iframeLoaded = true;
        finishIfStable();
      },
      { once: true },
    );
  };

  const poll = () => {
    if (isCancelled()) return;

    const iframe = getCalendarIframe(widget);
    if (iframe) attachIframeLoad(iframe);

    finishIfStable();
  };

  poll();
  const pollId = window.setInterval(poll, CALENDAR_POLL_MS);

  return () => window.clearInterval(pollId);
}

const TRUST_BADGES = [
  {
    label: SITE.booking.trustBadges[0].label,
    icon: FaStar,
    className: 'border-primary-muted bg-primary-soft text-primary-dark',
    iconClassName: 'text-primary',
  },
  {
    label: SITE.booking.trustBadges[1].label,
    icon: FaLock,
    className: 'border-sky-200 bg-sky-50 text-sky-800',
    iconClassName: 'text-sky-600',
  },
] as const;

const FEATURES = SITE.booking.features;

function StatusBanner() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-800">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <IconCheck className="size-3" />
      </span>
      Live calendar ready — policy shown before payment
    </div>
  );
}

const availabilityButtonClassName =
  'premium-shine relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary px-4 py-3.5 text-sm font-extrabold subpixel-antialiased text-primary-foreground shadow-sm transition hover:bg-primary-hover';

function AvailabilityLoadingBlock({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div
        className="booking-availability-loading flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200/80 bg-zinc-50 px-4 py-3.5 text-sm font-semibold text-zinc-600"
        aria-busy
        aria-live="polite"
      >
        <IconSpinner />
        Loading live calendar…
      </div>
    );
  }

  return (
    <div
      className="booking-availability-loading relative z-10 overflow-hidden rounded-2xl border border-primary/20 shadow-sm"
      aria-busy
      aria-live="polite"
    >
      <div className="flex items-center justify-center gap-2 bg-primary px-4 py-3.5 text-sm font-extrabold text-primary-foreground">
        <IconSpinner />
        Processing…
      </div>
      <div className="flex items-center gap-2 border-t border-zinc-200/70 bg-zinc-50 px-3 py-2.5 text-xs font-medium text-zinc-500">
        <span className="booking-load-pulse size-2 shrink-0 rounded-full bg-zinc-400" aria-hidden="true" />
        Loading live calendar…
      </div>
    </div>
  );
}

function AvailabilityReadyButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-expanded={false}
    >
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        <FaCalendarDays className="size-5" aria-hidden="true" />
        Check live availability
      </span>
      <CtaAttentionDot />
    </button>
  );
}

function CtaAttentionDot() {
  return (
    <span
      className="cta-attention-dot pointer-events-none absolute right-4 top-1/2 z-20 -translate-y-1/2"
      aria-hidden="true"
    />
  );
}

export default function BookingForm({
  onExpandedChange,
}: {
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const [loaderReady, setLoaderReady] = useState(false);
  const [calendarReady, setCalendarReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const pendingOpenRef = useRef(false);
  const calendarReadyRef = useRef(false);
  const ready = calendarReady;

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
    if (!loaderReady || calendarReadyRef.current) return;

    requestBokunWidgetScan();

    const widget = widgetRef.current;
    if (!widget) return;

    let cancelled = false;

    const markReady = () => {
      if (cancelled || calendarReadyRef.current) return;
      calendarReadyRef.current = true;
      setCalendarReady(true);
    };

    const stopStabilityWatch = waitForStableCalendar(
      widget,
      markReady,
      () => cancelled || calendarReadyRef.current,
    );

    const observer = new MutationObserver(() => {
      requestBokunWidgetScan();
    });
    observer.observe(widget, { childList: true, subtree: true });

    const fallbackId = window.setTimeout(markReady, 25000);

    return () => {
      cancelled = true;
      stopStabilityWatch();
      observer.disconnect();
      window.clearTimeout(fallbackId);
    };
  }, [loaderReady]);

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
        src={SITE.bokun.loaderUrl}
        strategy="lazyOnload"
        onReady={() => setLoaderReady(true)}
      />

      {!expanded && (
        <>
          <div className="mb-3 flex items-center justify-between gap-2">
            {TRUST_BADGES.map((badge) => {
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

          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <p className="leading-none">
              <span className="text-3xl font-bold tracking-tight text-zinc-900">
                {LOUVRE_TOUR.priceLabel}
              </span>
              <span className="ml-1 text-sm text-zinc-500">/ person</span>
            </p>
            <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">
              Ticket + Audio Guide
            </span>
          </div>

          <ul className="mb-4 flex flex-nowrap gap-1">
            {FEATURES.map((feature) => (
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
        ) : ready ? (
          <div className="booking-availability-ready relative z-10 space-y-2">
            <AvailabilityReadyButton
              onClick={() => setOpen(true)}
              className={availabilityButtonClassName}
            />
            <StatusBanner />
          </div>
        ) : (
          <AvailabilityLoadingBlock />
        )}

        {/* Preload off-screen with real dimensions; reveal instantly once expanded */}
        <div
          className={
            expanded
              ? 'relative z-0 max-h-[min(70vh,640px)] overflow-y-auto overscroll-contain opacity-100'
              : 'pointer-events-none absolute left-0 right-0 top-0 z-0 h-[min(640px,70vh)] overflow-hidden translate-x-[-200vw]'
          }
          aria-hidden={!expanded}
        >
          <div
            ref={widgetRef}
            className="bokunWidget min-h-[320px]"
            data-src={SITE.bokun.calendarUrl}
          />
        </div>
      </div>

      <a
        href={SITE.contact.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-success px-4 py-3 text-sm font-semibold text-success-foreground shadow-sm transition hover:bg-success-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2"
      >
        <BsWhatsapp className="whatsapp-blink size-4 shrink-0" aria-hidden="true" />
        Ask on WhatsApp
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
            href={SITE.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-success text-success-foreground shadow-sm transition hover:bg-success-hover"
            aria-label="Chat on WhatsApp"
          >
            <BsWhatsapp className="size-5" aria-hidden="true" />
          </a>
          <div className="min-w-0 flex-1">
            {ready ? (
              <AvailabilityReadyButton
                onClick={openFromSticky}
                className={availabilityButtonClassName}
              />
            ) : (
              <AvailabilityLoadingBlock compact />
            )}
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
