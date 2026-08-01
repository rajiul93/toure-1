import { prisma } from '@/lib/db'

export async function logUnansweredQuestionInDB({
  question,
  tourSlug,
}: {
  question: string
  tourSlug?: string | null
}) {
  return prisma.unansweredQuestion.create({
    data: {
      question,
      tourSlug: tourSlug || null,
    },
  })
}

export async function listUnansweredQuestionsFromDB({
  resolved,
}: {
  resolved?: boolean
} = {}) {
  return prisma.unansweredQuestion.findMany({
    where: {
      ...(resolved !== undefined && { isResolved: resolved }),
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function markUnansweredQuestionResolvedInDB(
  id: string,
  resolvedEntryId?: string | null,
) {
  return prisma.unansweredQuestion.update({
    where: { id },
    data: {
      isResolved: true,
      resolvedEntryId: resolvedEntryId || null,
    },
  })
}
