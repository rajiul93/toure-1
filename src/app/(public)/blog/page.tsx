import BlogPageContent from '@/components/blog/blog-page-content'
import QueryProvider from '@/components/providers/query-provider'
import { getCachedBlogListing } from '@/lib/blog-detail'
import { createSeoPageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return createSeoPageMetadata('blog')
}

export default async function BlogPage() {
  // Statically rendered and prefetchable; `revalidateBlogPaths` flushes the
  // `blog-posts` tag on every admin mutation, so this stays in sync without
  // paying a server round trip on each navigation.
  const initialData = await getCachedBlogListing()

  return (
    <QueryProvider>
      <BlogPageContent initialData={initialData} />
    </QueryProvider>
  )
}
