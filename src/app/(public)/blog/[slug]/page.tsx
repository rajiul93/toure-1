import BlogArticleView from '@/components/blog/blog-article-view'
import { resolveBlogPostBySlug, resolveRelatedBlogPosts } from '@/lib/blog-detail'
import { createBlogPostMetadata, createNotFoundBlogMetadata } from '@/lib/metadata'
import {
  countPublishedBlogsInDB,
  getPublishedBlogSlugsFromDB,
} from '@/lib/services/blog.service'
import { BLOG_POSTS } from '@/lib/blog-posts'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ slug: string }> }

/**
 * Prerendered. CMS edits still appear immediately because every read below is
 * tagged (`blog-posts` / `blog-<slug>`) and `revalidateBlogPaths` flushes those
 * tags on save — no `force-dynamic` needed, so navigation stays prefetched.
 */
export const dynamicParams = true

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await resolveBlogPostBySlug(slug)

  if (!post) {
    return createNotFoundBlogMetadata()
  }

  return createBlogPostMetadata(post)
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, relatedPosts] = await Promise.all([
    resolveBlogPostBySlug(slug),
    resolveRelatedBlogPosts(slug),
  ])

  if (!post) notFound()

  return <BlogArticleView blog={post} relatedPosts={relatedPosts} />
}

export async function generateStaticParams() {
  const publishedCount = await countPublishedBlogsInDB()

  if (publishedCount === 0) {
    return BLOG_POSTS.map((post) => ({ slug: post.slug }))
  }

  const slugs = await getPublishedBlogSlugsFromDB()
  return slugs.map((slug) => ({ slug }))
}
