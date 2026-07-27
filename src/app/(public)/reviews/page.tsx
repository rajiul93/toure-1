import ReviewsPageContent from './reviews-page-content'
import { createSeoPageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return createSeoPageMetadata('reviews')
}

export default function ReviewsPage() {
  return <ReviewsPageContent />
}
