import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import {
  deleteImageFromR2AndDB,
  getImageFromDB,
  updateImageInR2AndDB,
} from '@/lib/services/image.service'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const authResult = await requireTeamRoleApi()
  if ('error' in authResult) return authResult.error

  const { id } = await context.params

  try {
    const image = await getImageFromDB(id)

    if (!image) {
      return jsonError('Image not found', 404)
    }

    return NextResponse.json({ image })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch image'
    return jsonError(message, 500)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authResult = await requireTeamRoleApi()
  if ('error' in authResult) return authResult.error

  const { id } = await context.params

  try {
    const formData = await request.formData()
    const fileValue = formData.get('file')
    const altValue = formData.get('alt')

    const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null
    const alt =
      altValue === null ? undefined : typeof altValue === 'string' ? altValue : undefined

    if (!file && alt === undefined) {
      return jsonError('Provide a new file and/or alt text to update')
    }

    const image = await updateImageInR2AndDB({
      id,
      file,
      alt,
    })

    return NextResponse.json({ image })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update image'

    if (message === 'Image not found') {
      return jsonError(message, 404)
    }

    const status = message.includes('not configured') ? 503 : 400
    return jsonError(message, status)
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const authResult = await requireTeamRoleApi()
  if ('error' in authResult) return authResult.error

  const { id } = await context.params

  try {
    const result = await deleteImageFromR2AndDB(id)

    if (!result.deleted) {
      return NextResponse.json(
        {
          error: 'Image is in use and cannot be deleted',
          usages: result.usages,
        },
        { status: 409 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete image'

    if (message === 'Image not found') {
      return jsonError(message, 404)
    }

    return jsonError(message, 500)
  }
}
