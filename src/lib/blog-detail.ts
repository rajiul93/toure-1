import { BLOG_FORM_OPTIONS } from '@/lib/blog-form-options'
import { parseBlogGalleryImages, type BlogGalleryImage } from '@/lib/blog-gallery'
import { BLOG_POST_BODY, getBlogPost, BLOG_POSTS } from '@/lib/blog-posts'
import {
  repairBlogRecordInDBIfNeeded,
} from '@/lib/blog-html-repair'
import { BLOG_POSTS_TAG, blogSlugTag } from '@/lib/blog-revalidation'
import { dayjs } from '@/lib/dayjs'
import { prisma } from '@/lib/db'
import {
  countPublishedBlogsInDB,
  getRelatedBlogPostsFromDB,
  listPublicBlogPostsFromDB,
} from '@/lib/services/blog.service'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'

const DEFAULT_BLOG_IMAGE = '/images/banner/0.webp'

export type PublicBlogFaq = {
  question: string
  answer: string
}

export type PublicBlogGalleryImage = BlogGalleryImage

export type PublicRelatedBlogPost = {
  slug: string
  title: string
  date: string
  image: string
  categoryLabel: string
}

export type PublicBlogDetail = {
  slug: string
  title: string
  shortDescription: string
  description: string
  publishDate: string
  blogDate: string
  featuredImageUrl: string
  featuredImageAlt: string
  gallery: PublicBlogGalleryImage[]
  categoryLabel: string
  tags: string[]
  keywords: string[]
  faqs: PublicBlogFaq[]
  metaTitle: string
  metaDescription: string
  metaImageUrl: string
  metaImageAlt: string
  fbMetaTitle: string
  fbMetaDescription: string
  fbMetaImageUrl: string
  fbMetaImageAlt: string
  updatedAt: string
}

function resolveCategoryLabel(categoryId: string): string {
  return (
    BLOG_FORM_OPTIONS.categories.find((category) => category.id === categoryId)?.name ??
    categoryId
  )
}

function resolveTagLabels(tagIds: string[]): string[] {
  return tagIds.map(
    (tagId) =>
      BLOG_FORM_OPTIONS.tags.find((tag) => tag.id === tagId)?.name ?? tagId,
  )
}

function withDefaultImage(url: string): string {
  return url.trim() || DEFAULT_BLOG_IMAGE
}

export function getMockBlogDetail(slug: string): PublicBlogDetail | null {
  const post = getBlogPost(slug)
  if (!post) return null

  const paragraphs = BLOG_POST_BODY[slug] ?? []
  const description =
    paragraphs.length > 0
      ? paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')
      : `<p>${post.excerpt}</p>`

  return {
    slug: post.slug,
    title: post.title,
    shortDescription: post.excerpt,
    description,
    publishDate: post.date,
    blogDate: post.date,
    featuredImageUrl: withDefaultImage(post.image),
    featuredImageAlt: post.title,
    gallery: [],
    categoryLabel: post.category,
    tags: [post.category],
    keywords: [],
    faqs: [],
    metaTitle: post.title,
    metaDescription: post.excerpt,
    metaImageUrl: withDefaultImage(post.image),
    metaImageAlt: post.title,
    fbMetaTitle: post.title,
    fbMetaDescription: post.excerpt,
    fbMetaImageUrl: withDefaultImage(post.image),
    fbMetaImageAlt: post.title,
    updatedAt: dayjs(post.date).toISOString(),
  }
}

export async function getPublishedBlogBySlugFromDB(slug: string): Promise<PublicBlogDetail | null> {
  const blog = await prisma.blog.findFirst({
    where: {
      slug,
      isDeleted: false,
      publishStatus: 'PUBLISH',
    },
    include: {
      faqs: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!blog) return null

  const repairedBlog = await repairBlogRecordInDBIfNeeded(blog)
  return mapBlogRecordToPublicDetail(repairedBlog)
}

/**
 * Cross-request cache, invalidated by `revalidateBlogPaths` on any admin blog
 * mutation. Tagged with both the global list tag and this post's own tag so a
 * single-post edit doesn't have to flush every other post.
 *
 * The lazy blob-URL repair inside `getPublishedBlogBySlugFromDB` writes to the
 * DB; keeping it here means it runs at most once per cache miss instead of on
 * every page view.
 */
function getCachedBlogBySlug(slug: string) {
  return unstable_cache(
    () => getPublishedBlogBySlugFromDB(slug),
    ['published-blog-by-slug', slug],
    { tags: [BLOG_POSTS_TAG, blogSlugTag(slug)] },
  )()
}

const getCachedPublishedCount = unstable_cache(
  () => countPublishedBlogsInDB(),
  ['published-blog-count'],
  { tags: [BLOG_POSTS_TAG] },
)

/**
 * First page of the public listing, used to render `/blog` on the server.
 * Deliberately only the default page — search and pagination stay client-side
 * through `/api/blog`, so arbitrary user input never becomes a cache key.
 */
export const getCachedBlogListing = unstable_cache(
  () => listPublicBlogPostsFromDB({ page: 1, limit: 12 }),
  ['public-blog-listing', 'page-1'],
  { tags: [BLOG_POSTS_TAG] },
)

function getCachedRelatedPosts(excludeSlug: string, limit: number) {
  return unstable_cache(
    () => getRelatedBlogPostsFromDB(excludeSlug, limit),
    ['related-blog-posts', excludeSlug, String(limit)],
    { tags: [BLOG_POSTS_TAG] },
  )()
}

/**
 * `cache()` dedupes within a single request: `generateMetadata` and the page
 * body both resolve the same post, which previously issued the whole query set
 * twice.
 */
export const resolveBlogPostBySlug = cache(async function resolveBlogPostBySlug(
  slug: string,
): Promise<PublicBlogDetail | null> {
  const publishedCount = await getCachedPublishedCount()

  if (publishedCount > 0) {
    return getCachedBlogBySlug(slug)
  }

  return getMockBlogDetail(slug)
})

export const resolveRelatedBlogPosts = cache(async function resolveRelatedBlogPosts(
  excludeSlug: string,
  limit = 12,
): Promise<PublicRelatedBlogPost[]> {
  const publishedCount = await getCachedPublishedCount()

  if (publishedCount > 0) {
    return getCachedRelatedPosts(excludeSlug, limit)
  }

  return BLOG_POSTS.filter((post) => post.slug !== excludeSlug)
    .slice(0, limit)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      image: post.image,
      categoryLabel: post.category,
    }))
})

export function mapBlogRecordToPublicDetail(blog: {
  slug: string
  title: string
  shortDescription: string
  description: string
  publishDate: Date
  blogDate: Date
  featuredImageUrl: string
  featuredImageAlt: string
  galleryImages: unknown
  categoryId: string
  tags: string[]
  keywords: string[]
  metaTitle: string
  metaDescription: string
  metaImageUrl: string
  metaImageAlt: string
  fbMetaTitle: string
  fbMetaDescription: string
  fbMetaImageUrl: string
  fbMetaImageAlt: string
  updatedAt: Date
  faqs: Array<{ question: string; answer: string }>
}): PublicBlogDetail {
  const featuredImageUrl = withDefaultImage(blog.featuredImageUrl)
  const metaImageUrl = withDefaultImage(blog.metaImageUrl || blog.featuredImageUrl)
  const fbMetaImageUrl = withDefaultImage(
    blog.fbMetaImageUrl || blog.metaImageUrl || blog.featuredImageUrl,
  )

  return {
    slug: blog.slug,
    title: blog.title,
    shortDescription: blog.shortDescription,
    description: blog.description,
    publishDate: dayjs(blog.publishDate).format('YYYY-MM-DD'),
    blogDate: dayjs(blog.blogDate).format('YYYY-MM-DD'),
    featuredImageUrl,
    featuredImageAlt: blog.featuredImageAlt.trim() || blog.title,
    gallery: parseBlogGalleryImages(blog.galleryImages).filter((item) => item.url.trim()),
    categoryLabel: resolveCategoryLabel(blog.categoryId),
    tags: resolveTagLabels(blog.tags),
    keywords: blog.keywords,
    faqs: blog.faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })),
    metaTitle: blog.metaTitle.trim() || blog.title,
    metaDescription: blog.metaDescription.trim() || blog.shortDescription,
    metaImageUrl,
    metaImageAlt: blog.metaImageAlt.trim() || blog.featuredImageAlt.trim() || blog.title,
    fbMetaTitle: blog.fbMetaTitle.trim() || blog.metaTitle.trim() || blog.title,
    fbMetaDescription:
      blog.fbMetaDescription.trim() || blog.metaDescription.trim() || blog.shortDescription,
    fbMetaImageUrl,
    fbMetaImageAlt:
      blog.fbMetaImageAlt.trim() ||
      blog.metaImageAlt.trim() ||
      blog.featuredImageAlt.trim() ||
      blog.title,
    updatedAt: blog.updatedAt.toISOString(),
  }
}
