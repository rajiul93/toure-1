import PageHero from '@/components/page-hero'
import { createSeoPageMetadata } from '@/lib/metadata'
import { getAttractionTours } from '@/lib/tour-schema'
import { getTourConfigFromDB } from '@/lib/services/tour-settings.service'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FaStar } from 'react-icons/fa6'

export async function generateMetadata(): Promise<Metadata> {
  return createSeoPageMetadata('attractionTours')
}

export default async function AttractionToursPage() {
  const tourConfig = await getTourConfigFromDB()
  const tours = getAttractionTours(tourConfig)

  return (
    <div>
      <PageHero
        eyebrow="Attraction tours"
        title="Paris museum experiences with timed entry"
        description="Skip the longest queues with reserved slots, mobile tickets, and self-guided audio — starting with the Louvre."
      />

      <ul className="mt-8 grid gap-5 sm:grid-cols-2">
        {tours.map((tour) => (
          <li key={tour.slug}>
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={tour.image}
                  alt={tour.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-bold text-heading">{tour.priceLabel}</span>
                  <span className="inline-flex items-center gap-1 text-sm text-zinc-600">
                    <FaStar className="size-3.5 text-primary" aria-hidden="true" />
                    {tour.rating}
                  </span>
                </div>
                <h2 className="mt-2 text-base font-bold leading-snug text-heading sm:text-lg">
                  <Link href={tour.href} className="hover:text-primary">
                    {tour.title}
                  </Link>
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">{tour.excerpt}</p>
                <p className="mt-3 text-xs text-zinc-500">{tour.durationLabel}</p>
                <Link
                  href={tour.href}
                  className="mt-4 inline-flex w-fit rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                >
                  View tour
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  )
}
