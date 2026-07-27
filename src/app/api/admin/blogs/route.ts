import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import { createBlogInDB, listAdminBlogsFromDB } from '@/lib/services/blog.service'
import { adminBlogListQuerySchema } from '@/lib/validations/admin-blog.validation'
import { blogFormSchema } from '@/lib/validations/blog-form.validation'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authResult = await requireTeamRoleApi(['admin', 'manager', 'marketer'])
  if ('error' in authResult) return authResult.error

  const parsed = adminBlogListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid query')
  }

  try {
    const data = await listAdminBlogsFromDB(parsed.data)
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list blogs'
    return jsonError(message, 500)
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireTeamRoleApi(['admin', 'manager', 'marketer'])
  if ('error' in authResult) return authResult.error

  try {
    const body = await request.json()
    const parsed = blogFormSchema.safeParse(body)

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid blog data')
    }

    const blog = await createBlogInDB(parsed.data)
    return NextResponse.json({ blog }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create blog'
    const status = message.includes('already exists') ? 409 : 500
    return jsonError(message, status)
  }
}
