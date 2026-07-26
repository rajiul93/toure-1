import { getSiteUrl, LOUVRE_TOUR, TOUR_FAQ } from '@/lib/tour-schema'
import { SITE } from '@/lib/site-config'

export default function StructuredData() {
  const siteUrl = getSiteUrl()
  const productUrl = `${siteUrl}/`
  const imageUrl = `${siteUrl}${LOUVRE_TOUR.ogImage}`

  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: SITE.brand.full,
      description: LOUVRE_TOUR.shortDescription,
    },
    {
      '@type': 'TouristTrip',
      '@id': `${productUrl}#trip`,
      name: LOUVRE_TOUR.name,
      description: LOUVRE_TOUR.description,
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
        price: LOUVRE_TOUR.price,
        priceCurrency: LOUVRE_TOUR.priceCurrency,
        availability: 'https://schema.org/InStock',
        url: productUrl,
      },
      provider: {
        '@type': 'Organization',
        name: SITE.brand.full,
        url: siteUrl,
      },
    },
    {
      '@type': 'Product',
      '@id': `${productUrl}#product`,
      name: LOUVRE_TOUR.name,
      description: LOUVRE_TOUR.description,
      image: imageUrl,
      brand: {
        '@type': 'Brand',
        name: SITE.brand.full,
      },
      offers: {
        '@type': 'Offer',
        price: LOUVRE_TOUR.price,
        priceCurrency: LOUVRE_TOUR.priceCurrency,
        availability: 'https://schema.org/InStock',
        url: productUrl,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: LOUVRE_TOUR.rating,
        reviewCount: LOUVRE_TOUR.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${productUrl}#faq`,
      mainEntity: TOUR_FAQ.map((item) => ({
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
        latitude: LOUVRE_TOUR.meetingPointCoords.lat,
        longitude: LOUVRE_TOUR.meetingPointCoords.lng,
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
