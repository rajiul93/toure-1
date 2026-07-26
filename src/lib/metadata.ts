import type { Metadata } from 'next'
import { LOUVRE_TOUR } from '@/lib/tour-schema'
import { SITE } from '@/lib/site-config'

type PageMetadataOptions = {
  title: string
  description: string
  path: string
  image?: string
  imageAlt?: string
}

export function createPageMetadata({
  title,
  description,
  path,
  image = LOUVRE_TOUR.ogImage,
  imageAlt = 'Louvre Pyramid — timed entry tickets with audio guide',
}: PageMetadataOptions): Metadata {
  const resolvedTitle = path === '/' ? title : `${title} | ${SITE.brand.full}`

  return {
    title: resolvedTitle,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: path.startsWith('/blog/') ? 'article' : 'website',
      locale: 'en_US',
      url: path,
      siteName: SITE.brand.full,
      title: resolvedTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description,
      images: [image],
    },
  }
}
