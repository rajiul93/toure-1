'use client';

import { IconCheck, IconSpinner } from '@/components/icons';
import type { BokunCalendarPhase, BokunFailureCause } from '@/lib/bokun-ready';
import { FaCalendarDays } from 'react-icons/fa6';

/**
 * The booking CTA in all of its loading states.
 *
 * Rendered in two places — the sidebar card and the mobile sticky bar — so the
 * phase branching lives here once rather than being duplicated and drifting.
 */

const FAILURE_COPY: Record<BokunFailureCause, string> = {
  timeout: "It's taking longer than usual.",
  'iframe-error': 'The secure calendar could not be loaded.',
  offline: 'You appear to be offline.',
  'loader-error': 'The booking script could not be loaded.',
};

export const availabilityButtonClassName =
  'premium-shine relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary px-4 py-3.5 text-sm font-extrabold subpixel-antialiased text-primary-foreground shadow-sm transition hover:bg-primary-hover';

function CtaAttentionDot() {
  return (
    <span
      className="cta-attention-dot pointer-events-none absolute right-4 top-1/2 z-20 -translate-y-1/2"
      aria-hidden="true"
    />
  );
}

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

export default function AvailabilityControl({
  phase,
  failure,
  compact = false,
  announce = false,
  onOpen,
  onRetry,
}: {
  phase: BokunCalendarPhase;
  failure: BokunFailureCause | null;
  compact?: boolean;
  /** Only one instance may announce, or screen readers hear everything twice. */
  announce?: boolean;
  onOpen: () => void;
  onRetry: () => void;
}) {
  const busy = phase === 'idle' || phase === 'loading' || phase === 'delayed';
  const live = announce ? 'polite' : 'off';
  /** Retry reloads the page — see `retryCalendar` in booking-form.tsx. */
  const retryLabel = 'Reload';

  if (phase === 'ready') {
    if (compact) {
      return (
        <AvailabilityReadyButton
          onClick={onOpen}
          className={availabilityButtonClassName}
        />
      );
    }
    return (
      <div
        className="booking-availability-ready relative z-10 space-y-2"
        data-booking-phase="ready"
      >
        <AvailabilityReadyButton
          onClick={onOpen}
          className={availabilityButtonClassName}
        />
        <StatusBanner />
      </div>
    );
  }

  if (phase === 'failed') {
    if (compact) {
      return (
        <div
          className="flex w-full items-center justify-between gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-800"
          data-booking-phase="failed"
          aria-live={live}
        >
          <span className="min-w-0 truncate">Calendar unavailable</span>
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 rounded-xl bg-rose-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-800"
            aria-label="Reload the page to load the live availability calendar"
          >
            {retryLabel}
          </button>
        </div>
      );
    }
    return (
      <div
        className="relative z-10 space-y-2 rounded-2xl border border-rose-200 bg-rose-50 p-3"
        data-booking-phase="failed"
        role="alert"
      >
        <p className="text-sm font-bold text-rose-900">
          Live availability didn&apos;t load.
        </p>
        <p className="text-xs font-medium text-rose-800">
          {failure ? FAILURE_COPY[failure] : FAILURE_COPY.timeout} Reload to try
          again, or ask us on WhatsApp below.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="flex w-full items-center justify-center rounded-xl bg-rose-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-800"
          aria-label="Reload the page to load the live availability calendar"
        >
          {retryLabel}
        </button>
      </div>
    );
  }

  const delayed = phase === 'delayed';

  if (compact) {
    return (
      <div
        className="booking-availability-loading flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200/80 bg-zinc-50 px-4 py-3.5 text-sm font-semibold text-zinc-600"
        data-booking-phase={phase}
        aria-busy={busy}
        aria-live={live}
      >
        <IconSpinner />
        {delayed ? 'Still loading…' : 'Loading live calendar…'}
        {delayed ? (
          <button
            type="button"
            onClick={onRetry}
            className="ml-1 shrink-0 font-bold text-primary underline underline-offset-2"
            aria-label="Reload the page to load the live availability calendar"
          >
            {retryLabel}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className="booking-availability-loading relative z-10 overflow-hidden rounded-2xl border border-primary/20 shadow-sm"
      data-booking-phase={phase}
      aria-busy={busy}
      aria-live={live}
    >
      <div className="flex items-center justify-center gap-2 bg-primary px-4 py-3.5 text-sm font-extrabold text-primary-foreground">
        <IconSpinner />
        Processing…
      </div>
      {/* Same two-row shell in both states so nothing shifts when it goes amber. */}
      <div
        className={
          delayed
            ? 'flex items-center gap-2 border-t border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800'
            : 'flex items-center gap-2 border-t border-zinc-200/70 bg-zinc-50 px-3 py-2.5 text-xs font-medium text-zinc-500'
        }
      >
        <span
          className={
            delayed
              ? 'booking-load-pulse size-2 shrink-0 rounded-full bg-amber-500'
              : 'booking-load-pulse size-2 shrink-0 rounded-full bg-zinc-400'
          }
          aria-hidden="true"
        />
        {delayed ? 'Still loading live availability…' : 'Loading live calendar…'}
        {delayed ? (
          <button
            type="button"
            onClick={onRetry}
            className="ml-auto shrink-0 font-bold text-amber-900 underline underline-offset-2"
            aria-label="Reload the page to load the live availability calendar"
          >
            {retryLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
