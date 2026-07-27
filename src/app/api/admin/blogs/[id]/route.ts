import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import { revalidateBlogPaths } from '@/lib/blog-revalidation'
import { getBlogFromDB, softDeleteBlogInDB, updateBlogInDB } from '@/lib/services/blog.service'
import { blogFormSchema } from '@/lib/validations/blog-form.validation'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ADMIN_ROLES = ['admin'] as const

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
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
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
  if ('error' in authResult) return authResult.error

  const { id } = await context.params

  try {
    const existing = await getBlogFromDB(id)
    if (!existing?.form) {
      return jsonError('Blog not found', 404)
    }

    const previousSlug = existing.form.basic_info.slug
    const body = await request.json()
    const parsed = blogFormSchema.safeParse(body)

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid blog data')
    }

    const blog = await updateBlogInDB(id, parsed.data)
    revalidateBlogPaths({
      slug: parsed.data.basic_info.slug,
      previousSlug,
    })
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
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
  if ('error' in authResult) return authResult.error

  const { id } = await context.params

  try {
    const existing = await getBlogFromDB(id)
    if (!existing?.form) {
      return jsonError('Blog not found', 404)
    }

    const slug = existing.form.basic_info.slug
    await softDeleteBlogInDB(id)
    revalidateBlogPaths({ slug })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete blog'
    const status = message.includes('not found') ? 404 : 500
    return jsonError(message, status)
  }
}
