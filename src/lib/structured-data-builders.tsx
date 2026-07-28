import { getSiteUrl } from '@/lib/site-config'
import { serializeJsonLd } from '@/lib/json-ld'
import type { ResolvedSiteConfig } from '@/lib/site-config.types'
import type { ResolvedSiteSeoConfig } from '@/lib/site-seo.types'
import type { ResolvedTourConfig } from '@/lib/tour-config.types'

type SiteStructuredDataProps = {
  site: ResolvedSiteConfig
  seo: ResolvedSiteSeoConfig
  shortDescription: string
}

/** Organization + WebSite — safe on every public page. */
export function buildSiteStructuredGraph({
  site,
  seo,
  shortDescription,
}: SiteStructuredDataProps) {
  const siteUrl = getSiteUrl()
  const defaultImage = `${siteUrl}${seo.openGraph.defaultImage.url}`

  const orgLogoUrl = seo.organization.logo.url
    ? seo.organization.logo.url.startsWith('http')
      ? seo.organization.logo.url
      : `${siteUrl}${seo.organization.logo.url}`
    : defaultImage

  return [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: seo.organization.name || site.brand.full,
      description: seo.organization.description,
      url: siteUrl,
      logo: orgLogoUrl,
      ...(seo.organization.email ? { email: seo.organization.email } : {}),
      ...(seo.organization.telephone ? { telephone: seo.organization.telephone } : {}),
      ...(seo.organization.sameAs.length > 0 ? { sameAs: seo.organization.sameAs } : {}),
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: site.brand.full,
      description: shortDescription,
    },
  ]
}

type HomeStructuredDataProps = {
  site: ResolvedSiteConfig
  seo: ResolvedSiteSeoConfig
  tourConfig: ResolvedTourConfig
}

/** Tour-specific schema — home page only. */
export function buildHomeStructuredGraph({
  site,
  tourConfig,
}: Omit<HomeStructuredDataProps, 'seo'>) {
  const { louvreTour, faqs } = tourConfig
  const siteUrl = getSiteUrl()
  const productUrl = `${siteUrl}/`
  const imageUrl = `${siteUrl}${louvreTour.ogImage}`

  return [
    {
      '@type': 'TouristTrip',
      '@id': `${productUrl}#trip`,
      name: louvreTour.name,
      description: louvreTour.description,
      touristType: 'Self-guided museum visit',
      itinerary: {
        '@type': 'ItemList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Louvre Pyramid timed entry',
            description: 'Enter through the glass pyramid at your reserved time slot.',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Denon Wing highlights',
            description: 'Mona Lisa and Italian Renaissance galleries.',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Sully & Richelieu wings',
            description: 'Ancient collections, sculpture, and decorative arts.',
          },
        ],
      },
      offers: {
        '@type': 'Offer',
        price: louvreTour.price,
        priceCurrency: louvreTour.priceCurrency,
        availability: 'https://schema.org/InStock',
        url: productUrl,
      },
      provider: {
        '@type': 'Organization',
        name: site.brand.full,
        url: siteUrl,
      },
    },
    {
      '@type': 'Product',
      '@id': `${productUrl}#product`,
      name: louvreTour.name,
      description: louvreTour.description,
      image: imageUrl,
      brand: {
        '@type': 'Brand',
        name: site.brand.full,
      },
      offers: {
        '@type': 'Offer',
        price: louvreTour.price,
        priceCurrency: louvreTour.priceCurrency,
        availability: 'https://schema.org/InStock',
        url: productUrl,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: louvreTour.rating,
        reviewCount: louvreTour.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${productUrl}#faq`,
      mainEntity: faqs.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
    {
      '@type': 'TouristAttraction',
      name: 'Louvre Museum',
      description:
        'The world’s most visited museum in Paris, home to the Mona Lisa, Venus de Milo, and major art collections.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rue de Rivoli',
        addressLocality: 'Paris',
        postalCode: '75001',
        addressCountry: 'FR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: louvreTour.meetingPointCoords.lat,
        longitude: louvreTour.meetingPointCoords.lng,
      },
    },
  ]
}

export function renderJsonLd(graph: Record<string, unknown>[]) {
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
