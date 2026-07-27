import HomeStructuredData from '@/components/home-structured-data'
import HomePageContent from '@/app/(public)/home/home-page-content'
import { createSeoPageMetadata } from '@/lib/metadata'
import { loadPublicConfigWithFallback } from '@/lib/public-config'
import type { Metadata } from 'next'
import { preload } from 'react-dom'

export async function generateMetadata(): Promise<Metadata> {
  return createSeoPageMetadata('home')
}

export default async function Home() {
  const { tourConfig } = await loadPublicConfigWithFallback()
  preload(tourConfig.bannerPhotos[0].src, {
    as: 'image',
    fetchPriority: 'high',
  })

  return (
    <>
      <HomeStructuredData />
      <HomePageContent />
    </>
  )
}
