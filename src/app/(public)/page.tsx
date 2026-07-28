import HomeStructuredData from '@/components/home-structured-data'
import HomePageContent from '@/app/(public)/home/home-page-content'
import { createSeoPageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return createSeoPageMetadata('home')
}

export default async function Home() {
  // No manual `preload` of the banner: it pointed at the raw `/images/banner/…`
  // file, while `<Image priority>` requests `/_next/image?url=…`, so it warmed a
  // URL nothing used and downloaded the LCP image an extra time. `priority` on
  // the Image already emits the correct preload link.
  return (
    <>
      <HomeStructuredData />
      <HomePageContent />
    </>
  )
}
