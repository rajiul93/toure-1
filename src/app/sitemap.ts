import { BLOG_POSTS } from '@/lib/blog-posts'
import { dayjs, toDate } from '@/lib/dayjs'
import { listLegalPages } from '@/lib/legal-pages'
import {
  countPublishedBlogsInDB,
  listPublicBlogPostsFromDB,
} from '@/lib/services/blog.service'
import { getSiteSeoFromDB } from '@/lib/services/site-seo.service'
import { getSiteUrl } from '@/lib/site-config'
import { SEO_PAGE_PATHS } from '@/lib/site-seo.types'

import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getSiteSeoFromDB()
  const siteUrl = getSiteUrl()
  const now = dayjs().toDate()

  const staticPages = (
    ['home', 'about', 'reviews', 'blog', 'attractionTours'] as const
  ).map((key) => {
    const page = seo.pages[key]
    return {
      url: `${siteUrl}${SEO_PAGE_PATHS[key]}`,
      lastModified: now,
      changeFrequency: page.sitemapChangeFrequency,
      priority: page.sitemapPriority,
    }
  })

  const legalPages = listLegalPages().map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified: toDate(page.lastUpdated),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }))

  const publishedCount = await countPublishedBlogsInDB()

  const blogPages =
    publishedCount === 0
      ? BLOG_POSTS.map((post) => ({
          url: `${siteUrl}/blog/${post.slug}`,
          lastModified: toDate(post.date),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }))
      : (
          await listPublicBlogPostsFromDB({
            page: 1,
            limit: 500,
          })
        ).posts.map((post) => ({
          url: `${siteUrl}/blog/${post.slug}`,
          lastModified: toDate(post.date),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }))

  return [...staticPages, ...legalPages, ...blogPages]
}
