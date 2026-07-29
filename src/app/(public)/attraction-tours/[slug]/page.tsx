import AttractionTourDetailView from '@/components/attraction-tours/attraction-tour-detail-view'
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

  return createPageMetadata({
    title: tour.title,
    description: tour.overview.description,
    path: `/attraction-tours/${tour.slug}`,
    image: tour.gallery.bannerPhotos[0]?.src,
    imageAlt: tour.gallery.bannerPhotos[0]?.alt,
  })
}

export default async function AttractionTourDetailPage({ params }: Props) {
  const { slug } = await params
  const [tour, tourConfig] = await Promise.all([
    resolveAttractionTourDetail(slug),
    getTourConfigFromDB(),
  ])

  if (!tour) notFound()

  return <AttractionTourDetailView tour={tour} itineraryStops={tourConfig.itineraryStops} />
}
