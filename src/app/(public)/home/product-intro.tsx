import { IconStar } from '@/components/icons'
import { LOUVRE_TOUR } from '@/lib/tour-schema'
import {
  FaClock,
  FaHeadphones,
  FaLocationDot,
  FaMobileScreen,
  FaStar,
} from 'react-icons/fa6'

const BADGES = [
  {
    label: 'Popular choice',
    icon: FaStar,
    className: 'border-primary-muted bg-primary-soft text-primary-dark',
    iconClassName: 'text-primary',
  },
  {
    label: 'Timed-entry ticket',
    icon: FaClock,
    className: 'border-success-muted bg-success-soft text-success-dark',
    iconClassName: 'text-success',
  },
  {
    label: 'Mobile ticket',
    icon: FaMobileScreen,
    className: 'border-sky-200 bg-sky-50 text-sky-800',
    iconClassName: 'text-sky-600',
  },
] as const

const QUICK_FACTS = [
  {
    label: 'Paris',
    detail: 'Louvre Museum',
    icon: FaLocationDot,
    iconClassName: 'text-secondary',
  },
  {
    label: 'Timed entry',
    detail: 'Reserved slot',
    icon: FaClock,
    iconClassName: 'text-sky-600',
  },
  {
    label: 'Audio guide',
    detail: 'Multilingual',
    icon: FaHeadphones,
    iconClassName: 'text-violet-600',
  },
] as const

const FEATURES = [
  {
    label: 'Instant confirmation',
    icon: (
      <svg viewBox="0 0 20 20" className="size-3.5 text-amber-500" fill="currentColor" aria-hidden="true">
        <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
      </svg>
    ),
  },
  {
    label: 'Mobile ticket',
    icon: (
      <svg viewBox="0 0 20 20" className="size-3.5 text-rose-500" fill="currentColor" aria-hidden="true">
        <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v2H7V5zm0 4h6v2H7V9z" />
      </svg>
    ),
  },
  {
    label: 'Reserved timed entry',
    icon: (
      <svg viewBox="0 0 20 20" className="size-3.5 text-sky-500" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Audio guide included',
    icon: (
      <svg viewBox="0 0 20 20" className="size-3.5 text-secondary" fill="currentColor" aria-hidden="true">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
] as const

export default function ProductIntro() {
  return (
    <section className="py-4 sm:py-5" aria-labelledby="product-title">
      <div
        className="relative overflow-hidden  "
        role="group"
        aria-label="Tour highlights and rating"
      >
        <div
          className="pointer-events-none absolute inset-0 "
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
          <div className="order-2 flex flex-wrap items-center gap-2 sm:order-1 sm:gap-2.5">
            {BADGES.map((badge) => {
              const BadgeIcon = badge.icon
              return (
                <span
                  key={badge.label}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm sm:text-sm ${badge.className}`}
                >
                  <BadgeIcon className={`size-3.5 shrink-0 ${badge.iconClassName}`} aria-hidden="true" />
                  {badge.label}
                </span>
              )
            })}
          </div>

          <a
            href="/reviews"
            className="order-1 inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-primary-muted bg-primary-soft px-3 py-1.5 shadow-sm transition hover:border-primary hover:bg-primary-muted/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:order-2 sm:ml-auto sm:self-center sm:py-2"
            aria-label={`Rated ${LOUVRE_TOUR.rating} out of 5 stars — read ${LOUVRE_TOUR.reviewCountLabel} reviews`}
          >
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/90 px-2 py-0.5 shadow-sm ring-1 ring-primary-muted/60">
              <IconStar className="size-4 text-primary" />
              <span className="text-base font-extrabold tabular-nums text-heading">{LOUVRE_TOUR.rating}</span>
            </span>
            <span className="hidden text-primary-muted sm:inline" aria-hidden="true">
              ·
            </span>
            <span className="text-xs font-semibold text-primary-dark underline underline-offset-2 sm:text-sm">
              {LOUVRE_TOUR.reviewCountLabel} reviews
            </span>
          </a>
        </div>
      </div>

      <h1
        id="product-title"
        className="mt-3 text-xl font-bold leading-snug tracking-tight text-heading sm:text-2xl lg:text-[1.75rem]"
      >
        Louvre Museum Ticket + Audio Guide — Timed Entry
      </h1>

   

      <ul className="mt-3 flex flex-wrap gap-2">
        {QUICK_FACTS.map((fact) => {
          const FactIcon = fact.icon
          return (
            <li
              key={fact.label}
              className="inline-flex items-center gap-1.5 rounded-lg border border-success-muted bg-success-soft px-2.5 py-1.5 text-xs sm:text-sm"
            >
              <FactIcon
                className={`size-3.5 shrink-0 ${fact.iconClassName}`}
                aria-hidden="true"
              />
              <span className="font-semibold text-zinc-800">{fact.label}</span>
              <span className="text-zinc-400" aria-hidden="true">
                ·
              </span>
              <span className="text-zinc-500">{fact.detail}</span>
            </li>
          )
        })}
      </ul>

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-zinc-200 pt-3 sm:grid-cols-4">
        {FEATURES.map((feature) => (
          <li key={feature.label} className="flex min-w-0 items-center gap-2">
            <span
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-zinc-200/80 bg-white"
              aria-hidden="true"
            >
              {feature.icon}
            </span>
            <span className="text-xs font-semibold leading-tight text-heading sm:text-sm">
              {feature.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
