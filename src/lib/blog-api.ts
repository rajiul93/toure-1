import type { BlogPostListItem } from '@/app/api/blog/route'
import axios from 'axios'

type BlogPostsResponse = {
  posts: BlogPostListItem[]
}

export async function fetchBlogPosts(search: string): Promise<BlogPostListItem[]> {
  const { data } = await axios.get<BlogPostsResponse>('/api/blog', {
    params: search ? { search } : undefined,
  })

  return data.posts
}
