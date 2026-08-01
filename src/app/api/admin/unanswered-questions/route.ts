import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import { listUnansweredQuestionsFromDB } from '@/lib/services/unanswered-question.service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const ADMIN_ROLES = ['admin'] as const

const listQuerySchema = z.object({
  resolved: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
})

export async function GET(request: NextRequest) {
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
  if ('error' in authResult) return authResult.error

  const parsed = listQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid query')
  }

  try {
    const questions = await listUnansweredQuestionsFromDB({
      resolved: parsed.data.resolved,
    })
    return NextResponse.json({ questions })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list questions'
    console.error('[GET /api/admin/unanswered-questions]', error)
    return jsonError(message, 500)
  }
}
