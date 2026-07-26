import ReviewsPageContent from './reviews-page-content'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Traveler Reviews — Louvre Museum Tickets',
  description:
    'Read verified traveler reviews for Louvre Pyramid timed-entry tickets with audio guide. Rated 4.2 out of 5 from thousands of visitors.',
  path: '/reviews',
})

export default function ReviewsPage() {
  return <ReviewsPageContent />
}
