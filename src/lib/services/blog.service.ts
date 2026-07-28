import { dayjs, parseInputDate } from '@/lib/dayjs'
import { sanitizeBlogHtmlForSave } from '@/lib/blog-sanitize.server'
import { repairBlogRecordInDBIfNeeded } from '@/lib/blog-html-repair'
import { prisma } from '@/lib/db'
import { registerImageUsageInDB } from '@/lib/services/image.service'
import type { BlogFormValues, BlogPublishStatus } from '@/lib/validations/blog-form.validation'
import type { Blog, BlogFaq, Prisma, PublishStatus } from '../../../generated/prisma/client'

const BLOG_ENTITY_TYPE = 'blog'

type BlogWithFaqs = Blog & { faqs: BlogFaq[] }

function toDbPublishStatus(status: BlogPublishStatus): PublishStatus {
  return status === 'publish' ? 'PUBLISH' : 'DRAFT'
}

function fromDbPublishStatus(status: PublishStatus): BlogPublishStatus {
  return status === 'PUBLISH' ? 'publish' : 'draft'
}

async function mapFormToBlogFields(
  values: BlogFormValues,
): Promise<Omit<Prisma.BlogCreateInput, 'faqs' | 'isDeleted'>> {
  const description = await sanitizeBlogHtmlForSave(values.basic_info.description)

  return {
    blogDate: parseInputDate(values.basic_info.blog_date).toDate(),
    publishDate: parseInputDate(values.basic_info.publish_date).toDate(),
    publishStatus: toDbPublishStatus(values.basic_info.publish_status),
    authorId: values.basic_info.author_id,
    tags: values.basic_info.tags,
    keywords: values.basic_info.keywords,
    categoryId: values.basic_info.category_id,
    countryId: values.basic_info.country_id,
    title: values.basic_info.title,
    slug: values.basic_info.slug,
    shortDescription: values.basic_info.short_description,
    description,
    featuredImageUrl: values.basic_info.featured_image.url,
    featuredImageAlt: values.basic_info.featured_image.alt_text,
    isFeatured: values.basic_info.is_featured,
    metaTitle: values.meta_data.meta_title,
    metaDescription: values.meta_data.meta_description,
    metaImageUrl: values.meta_data.meta_image.url,
    metaImageAlt: values.meta_data.meta_image.alt_text,
    fbMetaTitle: values.social_meta_data.fb_meta_title,
    fbMetaDescription: values.social_meta_data.fb_meta_description,
    fbMetaImageUrl: values.social_meta_data.fb_meta_image.url,
    fbMetaImageAlt: values.social_meta_data.fb_meta_image.alt_text,
  }
}

async function mapFaqsToCreate(values: BlogFormValues) {
  return Promise.all(
    values.faqs.map(async (faq, index) => ({
      question: faq.question,
      answer: await sanitizeBlogHtmlForSave(faq.answer),
      sortOrder: index,
    })),
  )
}

export function blogToFormValues(blog: BlogWithFaqs): BlogFormValues {
  return {
    basic_info: {
      blog_date: dayjs(blog.blogDate).format('YYYY-MM-DD'),
      publish_date: dayjs(blog.publishDate).format('YYYY-MM-DD'),
      publish_status: fromDbPublishStatus(blog.publishStatus),
      is_delete: blog.isDeleted,
      author_id: blog.authorId,
      tags: blog.tags,
      keywords: blog.keywords,
      category_id: blog.categoryId,
      country_id: blog.countryId,
      title: blog.title,
      slug: blog.slug,
      short_description: blog.shortDescription,
      description: blog.description,
      featured_image: {
        url: blog.featuredImageUrl,
        alt_text: blog.featuredImageAlt,
      },
      is_featured: blog.isFeatured,
    },
    faqs: blog.faqs
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((faq) => ({
        question: faq.question,
        answer: faq.answer,
      })),
    meta_data: {
      meta_title: blog.metaTitle,
      meta_description: blog.metaDescription,
      meta_image: {
        url: blog.metaImageUrl,
        alt_text: blog.metaImageAlt,
      },
    },
    social_meta_data: {
      fb_meta_title: blog.fbMetaTitle,
      fb_meta_description: blog.fbMetaDescription,
      fb_meta_image: {
        url: blog.fbMetaImageUrl,
        alt_text: blog.fbMetaImageAlt,
      },
    },
  }
}

async function findImageIdByUrl(url: string) {
  if (!url.trim()) return null

  const image = await prisma.image.findFirst({
    where: { url },
    select: { id: true },
  })

  return image?.id ?? null
}

async function syncBlogImageUsages(blogId: string, values: BlogFormValues) {
  const imageFields = [
    { url: values.basic_info.featured_image.url, field: 'featured_image' },
    { url: values.meta_data.meta_image.url, field: 'meta_image' },
    { url: values.social_meta_data.fb_meta_image.url, field: 'fb_meta_image' },
  ] as const

  for (const item of imageFields) {
    const imageId = await findImageIdByUrl(item.url)
    if (!imageId) continue

    await registerImageUsageInDB({
      imageId,
      entityType: BLOG_ENTITY_TYPE,
      entityId: blogId,
      field: item.field,
    })
  }
}

function formatBlogRecord(blog: BlogWithFaqs) {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    publishDate: dayjs(blog.publishDate).format('YYYY-MM-DD'),
    publishStatus: fromDbPublishStatus(blog.publishStatus),
    isDeleted: blog.isDeleted,
    isFeatured: blog.isFeatured,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
  }
}

export async function listAdminBlogsFromDB(params: {
  page?: number
  limit?: number
  search?: string
}) {
  const page = params.page ?? 1
  const limit = params.limit ?? 10
  const skip = (page - 1) * limit
  const search = params.search?.trim()

  const where: Prisma.BlogWhereInput = {
    isDeleted: false,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        createdAt: true,
        publishDate: true,
        featuredImageUrl: true,
        featuredImageAlt: true,
        publishStatus: true,
      },
    }),
    prisma.blog.count({ where }),
  ])

  return {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      createdAt: item.createdAt.toISOString(),
      publishDate: dayjs(item.publishDate).format('YYYY-MM-DD'),
      thumbnailUrl: item.featuredImageUrl,
      thumbnailAlt: item.featuredImageAlt,
      publishStatus: fromDbPublishStatus(item.publishStatus),
    })),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}

export async function getPublishedBlogSlugsFromDB(): Promise<string[]> {
  const blogs = await prisma.blog.findMany({
    where: {
      isDeleted: false,
      publishStatus: 'PUBLISH',
    },
    select: { slug: true },
    orderBy: { publishDate: 'desc' },
  })

  return blogs.map((blog) => blog.slug)
}

export async function countPublishedBlogsInDB(): Promise<number> {
  return prisma.blog.count({
    where: {
      isDeleted: false,
      publishStatus: 'PUBLISH',
    },
  })
}

export async function listPublicBlogPostsFromDB(params: {
  page?: number
  limit?: number
  search?: string
}) {
  const page = params.page ?? 1
  const limit = params.limit ?? 12
  const search = params.search?.trim()

  const where: Prisma.BlogWhereInput = {
    isDeleted: false,
    publishStatus: 'PUBLISH',
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
            { shortDescription: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
            { tags: { has: search } },
            { keywords: { has: search } },
          ],
        }
      : {}),
  }

  const total = await prisma.blog.count({ where })
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const skip = (safePage - 1) * limit

  const items = await prisma.blog.findMany({
    where,
    orderBy: [{ publishDate: 'desc' }, { createdAt: 'desc' }],
    skip,
    take: limit,
    select: {
      slug: true,
      title: true,
      publishDate: true,
      featuredImageUrl: true,
    },
  })

  return {
    posts: items.map((item) => ({
      slug: item.slug,
      title: item.title,
      date: dayjs(item.publishDate).format('YYYY-MM-DD'),
      image: item.featuredImageUrl.trim() || '/images/banner/0.webp',
    })),
    page: safePage,
    limit,
    total,
    totalPages,
  }
}

export async function listBlogsFromDB(
  params: { page?: number; limit?: number; search?: string; includeDeleted?: boolean } = {},
) {
  const page = params.page ?? 1
  const limit = params.limit ?? 20
  const skip = (page - 1) * limit
  const search = params.search?.trim()
  const includeDeleted = params.includeDeleted ?? false

  const where: Prisma.BlogWhereInput = {
    ...(includeDeleted ? {} : { isDeleted: false }),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      orderBy: { publishDate: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        publishDate: true,
        publishStatus: true,
        isDeleted: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.blog.count({ where }),
  ])

  return {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      publishDate: dayjs(item.publishDate).format('YYYY-MM-DD'),
      publishStatus: fromDbPublishStatus(item.publishStatus),
      isDeleted: item.isDeleted,
      isFeatured: item.isFeatured,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getBlogFromDB(id: string) {
  const blog = await prisma.blog.findUnique({
    where: { id },
    include: {
      faqs: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!blog) return null

  const repairedBlog = await repairBlogRecordInDBIfNeeded(blog)

  return {
    ...formatBlogRecord(repairedBlog),
    form: blogToFormValues(repairedBlog),
  }
}

export async function createBlogInDB(values: BlogFormValues) {
  const slugTaken = await prisma.blog.findUnique({
    where: { slug: values.basic_info.slug },
    select: { id: true },
  })

  if (slugTaken) {
    throw new Error('A blog with this slug already exists')
  }

  const blog = await prisma.blog.create({
    data: {
      ...(await mapFormToBlogFields(values)),
      isDeleted: false,
      faqs: {
        create: await mapFaqsToCreate(values),
      },
    },
    include: {
      faqs: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  await syncBlogImageUsages(blog.id, values)

  return {
    ...formatBlogRecord(blog),
    form: blogToFormValues(blog),
  }
}

export async function updateBlogInDB(id: string, values: BlogFormValues) {
  const existing = await prisma.blog.findUnique({
    where: { id },
    select: { id: true, slug: true },
  })

  if (!existing) {
    throw new Error('Blog not found')
  }

  if (existing.slug !== values.basic_info.slug) {
    const slugTaken = await prisma.blog.findUnique({
      where: { slug: values.basic_info.slug },
      select: { id: true },
    })

    if (slugTaken && slugTaken.id !== id) {
      throw new Error('A blog with this slug already exists')
    }
  }

  const blog = await prisma.$transaction(async (tx) => {
    await tx.blogFaq.deleteMany({ where: { blogId: id } })

    return tx.blog.update({
      where: { id },
      data: {
        ...(await mapFormToBlogFields(values)),
        faqs: {
          create: await mapFaqsToCreate(values),
        },
      },
      include: {
        faqs: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })
  })

  await syncBlogImageUsages(blog.id, values)

  return {
    ...formatBlogRecord(blog),
    form: blogToFormValues(blog),
  }
}

export async function updateBlogPublishStatusInDB(
  id: string,
  publishStatus: BlogPublishStatus,
) {
  const existing = await prisma.blog.findFirst({
    where: { id, isDeleted: false },
    select: { id: true },
  })

  if (!existing) {
    throw new Error('Blog not found')
  }

  const blog = await prisma.blog.update({
    where: { id },
    data: { publishStatus: toDbPublishStatus(publishStatus) },
    include: {
      faqs: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  return formatBlogRecord(blog)
}

export async function softDeleteBlogInDB(id: string) {
  const existing = await prisma.blog.findFirst({
    where: { id, isDeleted: false },
    select: { id: true },
  })

  if (!existing) {
    throw new Error('Blog not found')
  }

  await prisma.blog.update({
    where: { id },
    data: { isDeleted: true },
  })

  return { deleted: true as const }
}
