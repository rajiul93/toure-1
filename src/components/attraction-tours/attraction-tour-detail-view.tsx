import type { ReactNode } from 'react'
import Banner from '@/app/(public)/home/banner'
import BookNowLink from '@/components/book-now-link'
import TourExperienceRail from '@/components/attraction-tours/tour-experience-rail'
import TourImportantInformationSection from '@/components/attraction-tours/tour-important-information-section'
import TourDetailMeetingSection from '@/components/attraction-tours/tour-detail-meeting-section'
import TourReviewsSlider from '@/components/attraction-tours/tour-reviews-slider'
import { IconCheck } from '@/components/icons'
import type { AttractionTourDetail } from '@/lib/attraction-tour-detail'
import type { ResolvedTourConfig } from '@/lib/tour-config.types'
import { prepareBlogArticleHtml } from '@/lib/blog-article-html'
import Link from 'next/link'
import { FaStar } from 'react-icons/fa6'

function SectionTitle({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="text-xl font-bold text-heading sm:text-2xl">
      {children}
    </h2>
  )
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-heading">
      <FaStar className="size-4 text-primary" aria-hidden />
      {rating.toFixed(1)}
    </span>
  )
}

export default function AttractionTourDetailView({
  tour,
  itineraryStops,
}: {
  tour: AttractionTourDetail
  itineraryStops: ResolvedTourConfig['itineraryStops']
}) {
  return (
    <div className="pb-24 lg:pb-0">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          {tour.breadcrumb.map((item, index) => (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {item.url ? (
                <Link href={item.url} className="transition hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-zinc-700">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <header className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
          {tour.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
          <RatingStars rating={tour.rating.average} />
          <span>({tour.rating.reviewCount.toLocaleString()} reviews)</span>
        </div>
      </header>

      <div className="mt-6 lg:mt-8">
        {/* `Banner`'s desktop grid sizes itself with `h-full`, i.e. height:100%,
            which only resolves against a parent with a definite height — a
            `min-height` is not enough, so the grid collapsed to 0 and left a
            blank gap. On the home page Hero sets that height in JS; here an
            aspect ratio gives it one declaratively. */}
        <div className="relative lg:aspect-2/1">
          <Banner
            bannerPhotos={tour.gallery.bannerPhotos}
            galleryPhotos={tour.gallery.galleryPhotos}
            viewAllLabel={`View all ${tour.gallery.galleryPhotos.length} photos`}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:hidden">
        <p className="text-sm text-zinc-500">From</p>
        <p className="text-2xl font-bold text-heading">{tour.bookingPanel.priceFrom}</p>
        <p className="text-sm text-zinc-500">{tour.bookingPanel.priceNote}</p>
        <ul className="mt-4 space-y-2">
          {tour.bookingPanel.secondaryOptions.map((option) => (
            <li key={option} className="flex items-center gap-2 text-sm text-zinc-700">
              <IconCheck className="size-4 shrink-0 text-success" aria-hidden />
              {option}
            </li>
          ))}
        </ul>
        <BookNowLink className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover">
          {tour.bookingPanel.primaryCta}
        </BookNowLink>
      </div>

      <section className="mt-8 border-t border-zinc-200 py-8" aria-labelledby="why-travelers-heading">
        <SectionTitle id="why-travelers-heading">Why travelers loved this experience</SectionTitle>
        <div className="mt-4 flex flex-wrap gap-2">
          {tour.whyTravelersLoved.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {tour.whyTravelersLoved.quotes.map((quote) => (
            <blockquote
              key={quote}
              className="rounded-2xl border border-zinc-200 bg-zinc-50/70 px-4 py-4 text-sm leading-relaxed text-zinc-700"
            >
              “{quote}”
            </blockquote>
          ))}
        </div>
      </section>

      <section className="border-t border-zinc-200 py-8" aria-labelledby="overview-heading">
        <SectionTitle id="overview-heading">Overview</SectionTitle>
        <div
          className="tour-rich-text mt-4 sm:text-base"
          dangerouslySetInnerHTML={{ __html: prepareBlogArticleHtml(tour.overview.description) }}
        />
        {tour.overview.highlightsHtml ? (
          <div
            className="tour-rich-text tour-rich-text--included mt-5"
            dangerouslySetInnerHTML={{
              __html: prepareBlogArticleHtml(tour.overview.highlightsHtml),
            }}
          />
        ) : null}
      </section>

      <TourImportantInformationSection sections={tour.importantInformation} />

      <TourDetailMeetingSection address={tour.meetingPointAddress} itineraryStops={itineraryStops} />

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-6" aria-labelledby="questions-heading">
        <SectionTitle id="questions-heading">Questions?</SectionTitle>
        <p className="mt-3 text-sm text-zinc-600">{tour.questionsSection.description}</p>
        <Link
          href={tour.questionsSection.ctaHref}
          className="mt-4 inline-flex rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-heading transition hover:border-primary hover:text-primary"
        >
          {tour.questionsSection.ctaLabel}
        </Link>
      </section>

      <section className="mt-8 border-t border-zinc-200 py-8" aria-labelledby="traveler-photos-heading">
        <SectionTitle id="traveler-photos-heading">Traveler photos</SectionTitle>
        <div className="scrollbar-none mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          {tour.travelerPhotos.map((photo) => (
            <div
              key={photo.url}
              className="relative aspect-square w-28 shrink-0 snap-start overflow-hidden rounded-xl bg-zinc-100 sm:w-32"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.alt} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      <TourReviewsSlider rating={tour.rating} reviews={tour.reviews} />

      <TourExperienceRail
        title="Customers who bought this tour also bought"
        items={tour.alsoBought}
      />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-xs text-zinc-500">From</p>
            <p className="text-lg font-bold text-heading">{tour.bookingPanel.priceFrom}</p>
          </div>
          <BookNowLink className="inline-flex shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover">
            {tour.bookingPanel.primaryCta}
          </BookNowLink>
        </div>
      </div>
    </div>
  )
}
