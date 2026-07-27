import type { BlogPostListResult } from '@/lib/blog-posts'
import axios from 'axios'

export async function fetchBlogPosts(params: {
  search: string
  page: number
}): Promise<BlogPostListResult> {
  const { data } = await axios.get<BlogPostListResult>('/api/blog', {
    params: {
      page: params.page,
      ...(params.search ? { search: params.search } : {}),
    },
  })

  return data
}
