import BlogPageContent from '@/components/blog/blog-page-content'
import QueryProvider from '@/components/providers/query-provider'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Latest Blog Posts — Louvre Tips & Museum Guides',
  description:
    'Planning tips, Louvre routes, and ticket advice for a calm, memorable museum day in Paris.',
  path: '/blog',
})

export default function BlogPage() {
  return (
    <QueryProvider>
      <BlogPageContent />
    </QueryProvider>
  )
}
