import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import { setKnowledgeBaseEntryPublishedInDB } from '@/lib/services/knowledge-base.service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const ADMIN_ROLES = ['admin'] as const

const toggleSchema = z.object({
  isPublished: z.boolean(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const { id } = await params
    const parsed = toggleSchema.safeParse(await request.json())

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid request')
    }

    const entry = await setKnowledgeBaseEntryPublishedInDB(id, parsed.data.isPublished)
    return NextResponse.json({ entry })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update publish status'
    console.error('[PATCH /api/admin/knowledge-base/[id]/publish]', error)
    return jsonError(message, 500)
  }
}
