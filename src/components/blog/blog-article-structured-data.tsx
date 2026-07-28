import { getSiteUrl } from '@/lib/site-config'
import { serializeJsonLd } from '@/lib/json-ld'
import type { PublicBlogDetail } from '@/lib/blog-detail'
import { getSiteConfigFromDB } from '@/lib/services/site-settings.service'
import { getSiteSeoFromDB } from '@/lib/services/site-seo.service'

function absoluteAssetUrl(path: string, siteUrl: string): string {
  if (!path) return siteUrl
  return path.startsWith('http') ? path : `${siteUrl}${path}`
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default async function BlogArticleStructuredData({
  blog,
}: {
  blog: PublicBlogDetail
}) {
  const [site, seo] = await Promise.all([getSiteConfigFromDB(), getSiteSeoFromDB()])
  const siteUrl = getSiteUrl()
  const pageUrl = `${siteUrl}/blog/${blog.slug}`
  const ogImagePath =
    blog.fbMetaImageUrl || blog.metaImageUrl || blog.featuredImageUrl
  const imageUrl = absoluteAssetUrl(ogImagePath, siteUrl)
  const orgLogoUrl = seo.organization.logo.url
    ? absoluteAssetUrl(seo.organization.logo.url, siteUrl)
    : imageUrl

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
        { '@type': 'ListItem', position: 3, name: blog.title, item: pageUrl },
      ],
    },
    {
      '@type': 'BlogPosting',
      '@id': `${pageUrl}#article`,
      headline: blog.title,
      description: blog.shortDescription,
      image: [imageUrl],
      datePublished: blog.publishDate,
      dateModified: blog.updatedAt,
      author: {
        '@type': 'Organization',
        name: site.brand.full,
      },
      publisher: {
        '@type': 'Organization',
        name: seo.organization.name || site.brand.full,
        logo: {
          '@type': 'ImageObject',
          url: orgLogoUrl,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pageUrl,
      },
      keywords: blog.keywords.join(', '),
      articleSection: blog.categoryLabel,
    },
  ]

  if (blog.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: blog.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: stripHtml(faq.answer),
        },
      })),
    })
  }

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
