import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import { updateBlogPublishStatusInDB } from '@/lib/services/blog.service'
import { adminBlogPublishStatusSchema } from '@/lib/validations/admin-blog.validation'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authResult = await requireTeamRoleApi(['admin', 'manager', 'marketer'])
  if ('error' in authResult) return authResult.error

  const { id } = await context.params

  try {
    const body = await request.json()
    const parsed = adminBlogPublishStatusSchema.safeParse(body)

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid publish status')
    }

    const blog = await updateBlogPublishStatusInDB(id, parsed.data.publishStatus)
    return NextResponse.json({ blog })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update publish status'
    const status = message.includes('not found') ? 404 : 500
    return jsonError(message, status)
  }
}
