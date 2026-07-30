import PageHero from '@/components/page-hero';
import { createSeoPageMetadata } from '@/lib/metadata';
import { resolvePublishedAttractionTourCards } from '@/lib/attraction-tour-public';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight, FaStar } from 'react-icons/fa6';

export async function generateMetadata(): Promise<Metadata> {
  return createSeoPageMetadata('attractionTours');
}

/**
 * Single attraction tours only. The Louvre package in tour-config is a combine
 * package presented on the home page, so it is deliberately NOT merged in here
 * — this listing shows exactly the tours managed at /admin/attraction-tours.
 */
export default async function AttractionToursPage() {
  const publishedTours = await resolvePublishedAttractionTourCards();

  const tours = publishedTours.map((tour) => ({
    slug: tour.slug,
    title: tour.title,
    excerpt: tour.excerpt,
    image: tour.imageUrl,
    priceLabel: tour.priceFrom,
    durationLabel: '',
    rating: tour.rating,
    href: tour.href,
  }));

  return (
    <div>
      {/* <PageHero
        eyebrow="Attraction tours"
        title="Paris museum experiences with timed entry"
        description="Skip the longest queues with reserved slots, mobile tickets, and self-guided audio."
      /> */}

      {tours.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-zinc-200 bg-white px-5 py-10 text-center text-sm text-zinc-500">
          No tours are published right now — please check back soon.
        </p>
      ) : null}

      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour) => (
          <li key={tour.slug}>
            {/*
              The whole card is the link. Rather than wrapping everything in an
              anchor (which swallows the heading and makes the screen-reader
              label a wall of text), a single link on the title stretches over
              the card with `after:absolute after:inset-0`. One focusable link
              per card, text stays selectable, and the "View tour" row below is
              purely decorative.
            */}
            <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-900/10 hover:ring-zinc-300 focus-within:ring-2 focus-within:ring-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src={tour.image}
                  alt={tour.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Scrim keeps the rating chip legible on a bright photo. */}
                <div
                  className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/25 to-transparent"
                  aria-hidden="true"
                />
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-heading shadow-sm backdrop-blur-sm">
                  <FaStar className="size-3 text-primary" aria-hidden="true" />
                  {tour.rating}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-base font-bold leading-snug text-heading">
                  <Link
                    href={tour.href}
                    className="transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-primary focus-visible:outline-none"
                  >
                    <span className="line-clamp-2">{tour.title}</span>
                  </Link>
                </h2>

                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600">
                  {tour.excerpt}
                </p>

                {tour.durationLabel ? (
                  <p className="mt-3 text-xs text-zinc-500">{tour.durationLabel}</p>
                ) : null}

                {/* `mt-auto` pins the footer down so cards of differing text
                    length still line their prices up across the row. */}
                <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                  <p className="leading-none">
                    <span className="block text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                      From
                    </span>
                    <span className="mt-1 block text-xl font-bold text-heading">
                      {tour.priceLabel}
                    </span>
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                    aria-hidden="true"
                  >
                    View tour
                    <FaArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
                  </span>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
