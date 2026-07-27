import { enforceApiRateLimit } from '@/lib/api-rate-limit'
import { listMockBlogPosts } from '@/lib/blog-posts'
import {
  countPublishedBlogsInDB,
  listPublicBlogPostsFromDB,
} from '@/lib/services/blog.service'
import { publicBlogListQuerySchema } from '@/lib/validations/public-blog.validation'
import { NextRequest, NextResponse } from 'next/server'

export type { BlogPostListItem, BlogPostListResult } from '@/lib/blog-posts'

export async function GET(request: NextRequest) {
  const limited = enforceApiRateLimit(request, {
    scope: 'public-blog',
    limit: 120,
    windowMs: 60_000,
  })
  if (limited) return limited

  const parsed = publicBlogListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid query' },
      { status: 400 },
    )
  }

  const { page, limit, search } = parsed.data

  try {
    const publishedCount = await countPublishedBlogsInDB()

    if (publishedCount === 0) {
      return NextResponse.json(listMockBlogPosts({ page, limit, search }))
    }

    const data = await listPublicBlogPostsFromDB({ page, limit, search })
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load blog posts'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
