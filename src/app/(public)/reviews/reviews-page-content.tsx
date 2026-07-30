import ReviewDate from '@/components/review-date'
import ReviewStars from '@/components/review-stars'
import PageHero from '@/components/page-hero'
import { IconStar } from '@/components/icons'
import { getTourConfigFromDB } from '@/lib/services/tour-settings.service'
import { resolveAttractionTourDetail } from '@/lib/attraction-tour-public'

const LOUVRE_SLUG = 'louvre-museum'

export default async function ReviewsPageContent() {
  const [tourConfig, tour] = await Promise.all([
    getTourConfigFromDB(),
    resolveAttractionTourDetail(LOUVRE_SLUG),
  ])

  const { louvreTour } = tourConfig
  const reviews = tour?.reviews.list ?? []

  return (
    <div>
      <PageHero
        eyebrow="Traveler reviews"
        title="What visitors say about the Louvre experience"
        description="Real feedback on timed entry, the audio guide, and exploring the museum at your own pace — from first-time visitors and repeat travelers."
      >
        <div className="inline-flex flex-wrap items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
          <span className="inline-flex items-center gap-1.5">
            <IconStar className="size-5 text-primary" />
            <span className="text-2xl font-bold tabular-nums">{louvreTour.rating}</span>
            <span className="text-sm text-zinc-300">/ 5</span>
          </span>
          <span className="hidden h-6 w-px bg-white/20 sm:block" aria-hidden="true" />
          <span className="text-sm font-medium text-zinc-200">
            {louvreTour.reviewCountLabel} verified reviews
          </span>
        </div>
      </PageHero>

      <div className="mt-8">
        <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <li key={`${review.reviewer}-${index}`}>
              <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <ReviewStars rating={review.rating} />
                  <ReviewDate value={review.date} className="text-xs text-zinc-400" />
                </div>

                <p className="mt-3 text-sm font-semibold text-heading">{review.reviewer}</p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-700">{review.text}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
