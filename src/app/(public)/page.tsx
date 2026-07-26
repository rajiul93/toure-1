import Hero from './home/hero'
import { createPageMetadata } from '@/lib/metadata'
import { LOUVRE_TOUR } from '@/lib/tour-schema'

export const metadata = createPageMetadata({
  title: LOUVRE_TOUR.title,
  description: LOUVRE_TOUR.description,
  path: '/',
})

export default function Home() {
  return <Hero />
}
