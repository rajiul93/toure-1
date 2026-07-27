import { BLOG_FORM_OPTIONS } from '@/lib/blog-form-options'
import { BLOG_POST_BODY, getBlogPost } from '@/lib/blog-posts'
import {
  repairBlogRecordInDBIfNeeded,
} from '@/lib/blog-html-repair'
import { dayjs } from '@/lib/dayjs'
import { prisma } from '@/lib/db'
import { countPublishedBlogsInDB } from '@/lib/services/blog.service'

const DEFAULT_BLOG_IMAGE = '/images/banner/0.webp'

export type PublicBlogFaq = {
  question: string
  answer: string
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

export async function resolveBlogPostBySlug(slug: string): Promise<PublicBlogDetail | null> {
  const publishedCount = await countPublishedBlogsInDB()

  if (publishedCount > 0) {
    return getPublishedBlogBySlugFromDB(slug)
  }

  return getMockBlogDetail(slug)
}

export function mapBlogRecordToPublicDetail(blog: {
  slug: string
  title: string
  shortDescription: string
  description: string
  publishDate: Date
  blogDate: Date
  featuredImageUrl: string
  featuredImageAlt: string
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
