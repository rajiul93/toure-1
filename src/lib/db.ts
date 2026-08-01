import { PrismaClient } from '../../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

/** Bump when Prisma schema changes so dev HMR picks up a fresh client. */
const PRISMA_CLIENT_VERSION = 'ai-kb-v1'

type PrismaGlobal = {
  prisma?: PrismaClient
  prismaClientVersion?: string
}

const globalForPrisma = globalThis as unknown as PrismaGlobal

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }

  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

function isClientReady(client: PrismaClient) {
  return (
    globalForPrisma.prismaClientVersion === PRISMA_CLIENT_VERSION &&
    typeof client.blog !== 'undefined' &&
    typeof client.image !== 'undefined' &&
    typeof client.siteSettings !== 'undefined' &&
    typeof client.tourSettings !== 'undefined' &&
    typeof client.seoSettings !== 'undefined' &&
    typeof client.attractionTour !== 'undefined' &&
    typeof client.knowledgeBaseEntry !== 'undefined' &&
    typeof client.unansweredQuestion !== 'undefined' &&
    typeof client.aiSettings !== 'undefined' &&
    typeof client.aiUsageLog !== 'undefined'
  )
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma

  if (cached && isClientReady(cached)) {
    return cached
  }

  if (cached) {
    void cached.$disconnect().catch(() => undefined)
  }

  const client = createPrismaClient()
  globalForPrisma.prisma = client
  globalForPrisma.prismaClientVersion = PRISMA_CLIENT_VERSION
  return client
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient()
    const value = client[property as keyof PrismaClient]

    if (typeof value === 'function') {
      return value.bind(client)
    }

    return value
  },
})
