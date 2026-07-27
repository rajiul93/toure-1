import type { BlogPostListResult } from '@/lib/blog-posts'

export async function fetchBlogPosts(params: {
  search: string
  page: number
}): Promise<BlogPostListResult> {
  const query = new URLSearchParams({ page: String(params.page) })
  if (params.search) query.set('search', params.search)

  const response = await fetch(`/api/blog?${query.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to load blog posts')
  }

  return response.json() as Promise<BlogPostListResult>
}
