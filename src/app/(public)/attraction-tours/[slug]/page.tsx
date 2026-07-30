import AttractionTourDetailView from '@/components/attraction-tours/attraction-tour-detail-view'
import AttractionTourStructuredData from '@/components/attraction-tours/attraction-tour-structured-data'
import { createPageMetadata } from '@/lib/metadata'
import {
  resolveAttractionTourDetail,
  resolveAttractionTourSlugs,
} from '@/lib/attraction-tour-public'
import type { Metadata } from 'next'
import { getTourConfigFromDB } from '@/lib/services/tour-settings.service'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await resolveAttractionTourSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tour = await resolveAttractionTourDetail(slug)

  if (!tour) {
    return createPageMetadata({
      title: 'Tour not found',
      description: 'This tour page could not be found.',
      path: `/attraction-tours/${slug}`,
    })
  }

  // `tour.seo` is already resolved: dashboard values where set, otherwise the
  // tour's own title / overview excerpt / feature image. Note the description
  // must never be raw `overview.description` — that is Quill HTML and would put
  // markup in the meta tag.
  return createPageMetadata({
    title: tour.seo.metaTitle,
    description: tour.seo.metaDescription,
    path: `/attraction-tours/${tour.slug}`,
    image: tour.seo.ogImage.url || undefined,
    imageAlt: tour.seo.ogImage.alt || undefined,
    keywords: tour.seo.metaKeywords.length > 0 ? tour.seo.metaKeywords : undefined,
    type: 'article',
  })
}

export default async function AttractionTourDetailPage({ params }: Props) {
  const { slug } = await params
  const [tour, tourConfig] = await Promise.all([
    resolveAttractionTourDetail(slug),
    getTourConfigFromDB(),
  ])

  if (!tour) notFound()

  return (
    <>
      <AttractionTourStructuredData tour={tour} />
      <AttractionTourDetailView tour={tour} itineraryStops={tourConfig.itineraryStops} />
    </>
  )
}
