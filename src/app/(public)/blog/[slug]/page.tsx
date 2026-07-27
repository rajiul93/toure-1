import BlogArticleView from '@/components/blog/blog-article-view'
import { resolveBlogPostBySlug } from '@/lib/blog-detail'
import { createBlogPostMetadata } from '@/lib/metadata'
import {
  countPublishedBlogsInDB,
  getPublishedBlogSlugsFromDB,
} from '@/lib/services/blog.service'
import { BLOG_POSTS } from '@/lib/blog-posts'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = true

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await resolveBlogPostBySlug(slug)

  if (!post) {
    return { title: 'Article not found' }
  }

  return createBlogPostMetadata(post)
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await resolveBlogPostBySlug(slug)

  if (!post) notFound()

  return <BlogArticleView blog={post} />
}

export async function generateStaticParams() {
  const publishedCount = await countPublishedBlogsInDB()

  if (publishedCount === 0) {
    return BLOG_POSTS.map((post) => ({ slug: post.slug }))
  }

  const slugs = await getPublishedBlogSlugsFromDB()
  return slugs.map((slug) => ({ slug }))
}
