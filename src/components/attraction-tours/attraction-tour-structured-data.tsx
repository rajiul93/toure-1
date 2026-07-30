import { getSiteUrl } from '@/lib/site-config'
import { serializeJsonLd } from '@/lib/json-ld'
import type { AttractionTourDetail } from '@/lib/attraction-tour-detail'
import { getSiteConfigFromDB } from '@/lib/services/site-settings.service'
import { getSiteSeoFromDB } from '@/lib/services/site-seo.service'

function absoluteAssetUrl(path: string, siteUrl: string): string {
  if (!path) return siteUrl
  return path.startsWith('http') ? path : `${siteUrl}${path}`
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default async function AttractionTourStructuredData({
  tour,
}: {
  tour: AttractionTourDetail
}) {
  const [site, seo] = await Promise.all([getSiteConfigFromDB(), getSiteSeoFromDB()])
  const siteUrl = getSiteUrl()
  const pageUrl = `${siteUrl}/attraction-tours/${tour.slug}`
  const imageUrl = tour.seo.ogImage.url
    ? absoluteAssetUrl(tour.seo.ogImage.url, siteUrl)
    : tour.gallery.bannerPhotos[0]?.src
      ? absoluteAssetUrl(tour.gallery.bannerPhotos[0].src, siteUrl)
      : siteUrl
  const orgLogoUrl = seo.organization.logo.url
    ? absoluteAssetUrl(seo.organization.logo.url, siteUrl)
    : imageUrl

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Attraction Tours',
          item: `${siteUrl}/attraction-tours`,
        },
        { '@type': 'ListItem', position: 3, name: tour.title, item: pageUrl },
      ],
    },
    {
      '@type': 'TouristAttraction',
      '@id': `${pageUrl}#attraction`,
      name: tour.title,
      description: stripHtml(tour.seo.metaDescription),
      image: [imageUrl],
      url: pageUrl,
      telephone: site.contact.whatsappNumber ? `+${site.contact.whatsappNumber}` : undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: stripHtml(tour.meetingPointAddress),
        addressCountry: 'FR',
      },
      aggregateRating:
        tour.rating.average > 0 && tour.rating.reviewCount > 0
          ? {
              '@type': 'AggregateRating',
              ratingValue: tour.rating.average.toFixed(1),
              reviewCount: tour.rating.reviewCount,
              bestRating: '5',
              worstRating: '1',
            }
          : undefined,
      review: tour.reviews.list
        .slice(0, 5)
        .filter((r: { text: string }) => r.text)
        .map((review: { reviewer: string; text: string; rating: number; date: string }) => ({
          '@type': 'Review',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating,
            bestRating: '5',
            worstRating: '1',
          },
          reviewBody: stripHtml(review.text),
          author: {
            '@type': 'Person',
            name: review.reviewer,
          },
          datePublished: review.date,
        })),
      priceRange: `€${tour.bookingPanel.priceFrom}`,
      offers: {
        '@type': 'Offer',
        url: pageUrl,
        priceCurrency: 'EUR',
        price: tour.bookingPanel.priceFrom.replace(/[^0-9.]/g, ''),
        availability: 'https://schema.org/Available',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pageUrl,
      },
    },
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd({
          '@context': 'https://schema.org',
          '@graph': graph,
        }),
      }}
    />
  )
}
