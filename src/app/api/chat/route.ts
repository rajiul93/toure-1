import { enforceApiRateLimit } from '@/lib/api-rate-limit'
import { answerFromKnowledgeBase } from '@/lib/ai/knowledge-base-chat'
import { jsonError } from '@/lib/auth/require-role-api'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const chatSchema = z.object({
  question: z.string().trim().min(1).max(500),
  tourSlug: z.string().trim().optional(),
})

export async function POST(request: NextRequest): Promise<Response> {
  const rateLimitResult = enforceApiRateLimit(request, {
    scope: 'chat',
    limit: 20,
    windowMs: 60_000,
  })

  if (rateLimitResult) {
    return rateLimitResult
  }

  try {
    const parsed = chatSchema.safeParse(await request.json())

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid request', 400)
    }

    const { answer, status } = await answerFromKnowledgeBase(parsed.data.question, {
      tourSlug: parsed.data.tourSlug,
    })

    return NextResponse.json({
      answer,
      offerWhatsappHandoff: status === 'unresolved',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process question'
    console.error('[POST /api/chat]', error)
    return jsonError(message, 500)
  }
}
