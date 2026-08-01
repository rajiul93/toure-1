import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import { markUnansweredQuestionResolvedInDB } from '@/lib/services/unanswered-question.service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const ADMIN_ROLES = ['admin'] as const

const resolveSchema = z.object({
  resolvedEntryId: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const { id } = await params
    const parsed = resolveSchema.safeParse(await request.json())

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid request')
    }

    const result = await markUnansweredQuestionResolvedInDB(id, parsed.data.resolvedEntryId)
    return NextResponse.json({ result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark as resolved'
    console.error('[PATCH /api/admin/unanswered-questions/[id]/resolve]', error)
    return jsonError(message, 500)
  }
}
