import Hero from './home/hero'
import { createSeoPageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return createSeoPageMetadata('home')
}

export default function Home() {
  return <Hero />
}
