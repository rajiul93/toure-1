import { prisma } from '@/lib/db'
import type { KnowledgeBaseCategory } from '../../../generated/prisma/client'

export async function listAdminKnowledgeBaseFromDB({
  page = 1,
  limit = 20,
  search,
  category,
  tourSlug,
}: {
  page?: number
  limit?: number
  search?: string
  category?: KnowledgeBaseCategory
  tourSlug?: string | null
} = {}) {
  const skip = (page - 1) * limit

  const where = {
    isDeleted: false,
    ...(search && {
      OR: [
        { question: { contains: search, mode: 'insensitive' as const } },
        { answer: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(category && { category }),
    ...(tourSlug !== undefined && { tourSlug }),
  }

  const [items, total] = await Promise.all([
    prisma.knowledgeBaseEntry.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.knowledgeBaseEntry.count({ where }),
  ])

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getKnowledgeBaseEntryFromDB(
  id: string,
): Promise<Awaited<ReturnType<typeof prisma.knowledgeBaseEntry.findUnique>> | null> {
  return prisma.knowledgeBaseEntry.findUnique({
    where: { id },
  })
}

export async function createKnowledgeBaseEntryInDB(values: {
  tourSlug?: string | null
  category: string
  question: string
  answer: string
  isPublished: boolean
  sortOrder: number
}) {
  return prisma.knowledgeBaseEntry.create({
    data: {
      tourSlug: values.tourSlug || null,
      category: values.category as any,
      question: values.question,
      answer: values.answer,
      isPublished: values.isPublished,
      sortOrder: values.sortOrder,
    },
  })
}

export async function updateKnowledgeBaseEntryInDB(
  id: string,
  values: {
    tourSlug?: string | null
    category?: string
    question?: string
    answer?: string
    isPublished?: boolean
    sortOrder?: number
  },
) {
  return prisma.knowledgeBaseEntry.update({
    where: { id },
    data: {
      ...(values.tourSlug !== undefined && { tourSlug: values.tourSlug || null }),
      ...(values.category && { category: values.category as any }),
      ...(values.question && { question: values.question }),
      ...(values.answer && { answer: values.answer }),
      ...(values.isPublished !== undefined && { isPublished: values.isPublished }),
      ...(values.sortOrder !== undefined && { sortOrder: values.sortOrder }),
    },
  })
}

export async function softDeleteKnowledgeBaseEntryInDB(id: string) {
  return prisma.knowledgeBaseEntry.update({
    where: { id },
    data: { isDeleted: true },
  })
}

export async function setKnowledgeBaseEntryPublishedInDB(id: string, isPublished: boolean) {
  return prisma.knowledgeBaseEntry.update({
    where: { id },
    data: { isPublished },
  })
}

export async function listPublishedKnowledgeBaseForChat() {
  return prisma.knowledgeBaseEntry.findMany({
    where: {
      isPublished: true,
      isDeleted: false,
    },
    select: {
      tourSlug: true,
      category: true,
      question: true,
      answer: true,
    },
    orderBy: { sortOrder: 'asc' },
  })
}
