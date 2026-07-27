import { getSiteUrl } from '@/lib/site-config'
import type { LegalPageContent } from '@/lib/legal-pages'

export default function LegalStructuredData({ page }: { page: LegalPageContent }) {
  const siteUrl = getSiteUrl()
  const pageUrl = `${siteUrl}${page.path}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: page.title,
        description: page.metaDescription,
        dateModified: page.lastUpdated,
        isPartOf: {
          '@type': 'WebSite',
          url: siteUrl,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: page.title,
            item: pageUrl,
          },
        ],
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
