import { BLOG_POSTS } from '@/lib/blog-posts'
import { NextRequest, NextResponse } from 'next/server'

export type BlogPostListItem = {
  slug: string
  title: string
  date: string
  image: string
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search')?.trim().toLowerCase() ?? ''

  let posts: BlogPostListItem[] = BLOG_POSTS.map(({ slug, title, date, image }) => ({
    slug,
    title,
    date,
    image,
  })).sort((a, b) => b.date.localeCompare(a.date))

  if (search) {
    posts = posts.filter((post) => {
      const source = BLOG_POSTS.find((item) => item.slug === post.slug)
      if (!source) return false

      const haystack = `${source.title} ${source.excerpt} ${source.category}`.toLowerCase()
      return haystack.includes(search)
    })
  }

  return NextResponse.json({ posts })
}
