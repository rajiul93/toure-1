import BlogPageContent from '@/components/blog/blog-page-content'
import QueryProvider from '@/components/providers/query-provider'
import { createSeoPageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return createSeoPageMetadata('blog')
}

export default function BlogPage() {
  return (
    <QueryProvider>
      <BlogPageContent />
    </QueryProvider>
  )
}
