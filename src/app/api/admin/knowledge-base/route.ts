import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import {
  createKnowledgeBaseEntryInDB,
  listAdminKnowledgeBaseFromDB,
} from '@/lib/services/knowledge-base.service'
import { knowledgeBaseSubmissionSchema } from '@/lib/validations/knowledge-base.validation'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const ADMIN_ROLES = ['admin'] as const

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().optional(),
  category: z.string().optional(),
  tourSlug: z.string().trim().optional(),
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
    const { category, ...rest } = parsed.data
    const result = await listAdminKnowledgeBaseFromDB({
      ...rest,
      category: category as any,
    })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list knowledge base'
    console.error('[GET /api/admin/knowledge-base]', error)
    return jsonError(message, 500)
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const parsed = knowledgeBaseSubmissionSchema.safeParse(await request.json())

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid knowledge base entry')
    }

    const entry = await createKnowledgeBaseEntryInDB(parsed.data)
    return NextResponse.json({ entry }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create entry'
    return jsonError(message, 500)
  }
}
