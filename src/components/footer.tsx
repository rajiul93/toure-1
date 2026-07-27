'use client'

import BookNowLink from '@/components/book-now-link'
import { BrandLogoLink } from '@/components/brand-logo'
import HomeSectionLink from '@/components/home-section-link'
import { IconCalendar, IconLock, IconStar } from '@/components/icons'
import { useSiteConfig } from '@/components/site-config/site-config-provider'
import { useTourConfig } from '@/components/tour-config/tour-config-provider'
import { dayjs } from '@/lib/dayjs'
import { getHomeSectionLinks } from '@/lib/home-sections'
import Link from 'next/link'
import { BsWhatsapp } from 'react-icons/bs'
import { FaLocationDot } from 'react-icons/fa6'

export default function Footer() {
  const site = useSiteConfig()
  const { louvreTour } = useTourConfig()
  const year = dayjs().year()
  const sectionLinks = getHomeSectionLinks()

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-white/10 bg-heading text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-secondary/5"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <BrandLogoLink
              nameClassName="text-lg font-bold tracking-tight text-white"
              scriptClassName="font-script text-2xl leading-none text-secondary"
              imageClassName="h-9 w-auto max-w-[180px] object-contain brightness-0 invert"
              className="inline-flex items-baseline gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-heading"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-300">
              {louvreTour.shortDescription} {site.footerDescription}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm backdrop-blur-sm">
              <IconStar className="size-4 text-primary" />
              <span className="font-bold tabular-nums">{louvreTour.rating}</span>
              <span className="text-zinc-400">·</span>
              <span className="text-zinc-300">{louvreTour.reviewCountLabel} reviews</span>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-2">
            <nav aria-label="Footer exploration">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Explore
              </h2>
              <ul className="mt-4 space-y-2.5">
                {sectionLinks.map((link) => (
                  <li key={link.href}>
                    <HomeSectionLink
                      href={link.href}
                      className="text-sm text-zinc-300 transition hover:text-white"
                    >
                      {link.label}
                    </HomeSectionLink>
                  </li>
                ))}
                {site.footerPages.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-300 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Visit details
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                <li className="flex gap-2.5">
                  <FaLocationDot className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden="true" />
                  <span>{louvreTour.meetingPoint}</span>
                </li>
                <li>
                  <span className="font-medium text-white">Duration:</span>{' '}
                  {louvreTour.durationLabel}
                </li>
                <li>
                  <span className="font-medium text-white">From:</span> {louvreTour.priceLabel}{' '}
                  per person
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Ready to visit?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              Check live availability and secure your timed-entry slot at the Louvre Pyramid.
            </p>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row lg:flex-col">
              <BookNowLink
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-heading"
              >
                <IconCalendar className="size-4" />
                Check availability
              </BookNowLink>
              <a
                href={site.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 focus-visible:ring-offset-heading"
              >
                <BsWhatsapp className="size-4 text-success" aria-hidden="true" />
                {site.contact.whatsappCtaLabel}
              </a>
            </div>

            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-zinc-400">
              <IconLock className="size-3.5 text-zinc-500" />
              Secure checkout · Policy shown before payment
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            © {year} {louvreTour.brand}. All rights reserved.
          </p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {site.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-zinc-400 transition hover:text-zinc-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
