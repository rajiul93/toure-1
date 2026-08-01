import { prisma } from '@/lib/db'

export async function logAiUsageInDB({
  provider,
  model,
  promptTokens,
  completionTokens,
  totalTokens,
  status,
  question,
  tourSlug,
}: {
  provider: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  status: string
  question: string
  tourSlug?: string | null
}) {
  return prisma.aiUsageLog.create({
    data: {
      provider,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      status,
      question,
      tourSlug: tourSlug || null,
    },
  })
}

export type AiUsageTotals = {
  requests: number
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

const EMPTY_TOTALS: AiUsageTotals = {
  requests: 0,
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
}

async function sumUsageSince(since: Date): Promise<AiUsageTotals> {
  const result = await prisma.aiUsageLog.aggregate({
    where: { createdAt: { gte: since } },
    _count: { _all: true },
    _sum: { promptTokens: true, completionTokens: true, totalTokens: true },
  })

  return {
    requests: result._count._all,
    promptTokens: result._sum.promptTokens ?? 0,
    completionTokens: result._sum.completionTokens ?? 0,
    totalTokens: result._sum.totalTokens ?? 0,
  }
}

export type AiUsageByModel = AiUsageTotals & {
  provider: string
  model: string
}

/**
 * Everything the usage page needs, in one round trip group:
 * headline totals for three windows, a per-model breakdown for the last 30
 * days, and the most recent individual requests.
 */
export async function getAiUsageOverviewFromDB() {
  const now = Date.now()
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0))
  const last7 = new Date(now - 7 * 24 * 60 * 60 * 1000)
  const last30 = new Date(now - 30 * 24 * 60 * 60 * 1000)

  const [today, week, month, grouped, recent] = await Promise.all([
    sumUsageSince(startOfToday).catch(() => EMPTY_TOTALS),
    sumUsageSince(last7).catch(() => EMPTY_TOTALS),
    sumUsageSince(last30).catch(() => EMPTY_TOTALS),
    prisma.aiUsageLog.groupBy({
      by: ['provider', 'model'],
      where: { createdAt: { gte: last30 } },
      _count: { _all: true },
      _sum: { promptTokens: true, completionTokens: true, totalTokens: true },
      orderBy: { _sum: { totalTokens: 'desc' } },
    }),
    prisma.aiUsageLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ])

  const byModel: AiUsageByModel[] = grouped.map((g) => ({
    provider: g.provider,
    model: g.model,
    requests: g._count._all,
    promptTokens: g._sum.promptTokens ?? 0,
    completionTokens: g._sum.completionTokens ?? 0,
    totalTokens: g._sum.totalTokens ?? 0,
  }))

  return { today, week, month, byModel, recent }
}
