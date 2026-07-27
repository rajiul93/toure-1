import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import { getBlogFromDB, softDeleteBlogInDB, updateBlogInDB } from '@/lib/services/blog.service'
import { blogFormSchema } from '@/lib/validations/blog-form.validation'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const authResult = await requireTeamRoleApi(['admin', 'manager', 'marketer'])
  if ('error' in authResult) return authResult.error

  const { id } = await context.params

  try {
    const blog = await getBlogFromDB(id)

    if (!blog) {
      return jsonError('Blog not found', 404)
    }

    return NextResponse.json({ blog })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load blog'
    return jsonError(message, 500)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authResult = await requireTeamRoleApi(['admin', 'manager', 'marketer'])
  if ('error' in authResult) return authResult.error

  const { id } = await context.params

  try {
    const body = await request.json()
    const parsed = blogFormSchema.safeParse(body)

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid blog data')
    }

    const blog = await updateBlogInDB(id, parsed.data)
    return NextResponse.json({ blog })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update blog'
    const status = message.includes('not found')
      ? 404
      : message.includes('already exists')
        ? 409
        : 500
    return jsonError(message, status)
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const authResult = await requireTeamRoleApi(['admin', 'manager', 'marketer'])
  if ('error' in authResult) return authResult.error

  const { id } = await context.params

  try {
    await softDeleteBlogInDB(id)
    return NextResponse.json({ deleted: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete blog'
    const status = message.includes('not found') ? 404 : 500
    return jsonError(message, status)
  }
}
