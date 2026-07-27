import { getSiteUrl } from '@/lib/tour-schema'
import { getSiteConfigFromDB } from '@/lib/services/site-settings.service'
import { getSiteSeoFromDB } from '@/lib/services/site-seo.service'
import { getTourConfigFromDB } from '@/lib/services/tour-settings.service'

export default async function StructuredData() {
  const [site, tourConfig, seo] = await Promise.all([
    getSiteConfigFromDB(),
    getTourConfigFromDB(),
    getSiteSeoFromDB(),
  ])
  const { louvreTour, faqs } = tourConfig
  const siteUrl = getSiteUrl()
  const productUrl = `${siteUrl}/`
  const imageUrl = `${siteUrl}${louvreTour.ogImage}`

  const orgLogoUrl = seo.organization.logo.url
    ? seo.organization.logo.url.startsWith('http')
      ? seo.organization.logo.url
      : `${siteUrl}${seo.organization.logo.url}`
    : imageUrl

  const graph = [
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
      description: louvreTour.shortDescription,
    },
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': graph,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
