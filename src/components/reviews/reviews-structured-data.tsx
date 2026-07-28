import { getSiteUrl } from '@/lib/site-config'
import { serializeJsonLd } from '@/lib/json-ld'
import { loadPublicConfigWithFallback } from '@/lib/public-config'
import { REVIEWS } from '@/lib/reviews-data'

export default async function ReviewsStructuredData() {
  const { tourConfig } = await loadPublicConfigWithFallback()
  const { louvreTour } = tourConfig
  const siteUrl = getSiteUrl()
  const pageUrl = `${siteUrl}/reviews`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: 'Traveler reviews',
        description: 'Filterable traveler reviews for Day Tour Paris Louvre timed-entry tickets.',
      },
      {
        '@type': 'Product',
        name: louvreTour.name,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: louvreTour.rating,
          reviewCount: louvreTour.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
        review: REVIEWS.slice(0, 10).map((review) => ({
          '@type': 'Review',
          author: { '@type': 'Person', name: review.author },
          datePublished: review.date,
          reviewBody: review.text,
          reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating,
            bestRating: 5,
            worstRating: 1,
          },
        })),
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
  )
}
