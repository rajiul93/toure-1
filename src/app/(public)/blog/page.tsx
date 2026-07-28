import BlogPageContent from '@/components/blog/blog-page-content'
import QueryProvider from '@/components/providers/query-provider'
import { createSeoPageMetadata } from '@/lib/metadata'
import { listPublicBlogPostsFromDB } from '@/lib/services/blog.service'
import type { Metadata } from 'next'
import { connection } from 'next/server'

/** Keep listing in sync when posts are created, published, or deleted. */
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return createSeoPageMetadata('blog')
}

export default async function BlogPage() {
  await connection()
  const initialData = await listPublicBlogPostsFromDB({ page: 1, limit: 12 })

  return (
    <QueryProvider>
      <BlogPageContent initialData={initialData} />
    </QueryProvider>
  )
}
