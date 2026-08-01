import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import {
  getKnowledgeBaseEntryFromDB,
  softDeleteKnowledgeBaseEntryInDB,
  updateKnowledgeBaseEntryInDB,
} from '@/lib/services/knowledge-base.service'
import { knowledgeBaseSubmissionSchema } from '@/lib/validations/knowledge-base.validation'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ADMIN_ROLES = ['admin'] as const

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const { id } = await params
    const entry = await getKnowledgeBaseEntryFromDB(id)

    if (!entry) {
      return jsonError('Entry not found', 404)
    }

    return NextResponse.json({ entry })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch entry'
    console.error('[GET /api/admin/knowledge-base/[id]]', error)
    return jsonError(message, 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const { id } = await params
    const parsed = knowledgeBaseSubmissionSchema.safeParse(await request.json())

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid entry data')
    }

    const entry = await updateKnowledgeBaseEntryInDB(id, parsed.data)
    return NextResponse.json({ entry })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update entry'
    console.error('[PATCH /api/admin/knowledge-base/[id]]', error)
    return jsonError(message, 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const { id } = await params
    await softDeleteKnowledgeBaseEntryInDB(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete entry'
    console.error('[DELETE /api/admin/knowledge-base/[id]]', error)
    return jsonError(message, 500)
  }
}
