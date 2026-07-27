import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import {
  deleteImageFromR2AndDB,
  getImageFromDB,
  listImagesFromDB,
  uploadImageToR2AndDB,
} from '@/lib/services/image.service'
import { listImagesQuerySchema } from '@/lib/validations/image.validation'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authResult = await requireTeamRoleApi()
  if ('error' in authResult) return authResult.error

  const parsed = listImagesQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid query')
  }

  try {
    const data = await listImagesFromDB(parsed.data)
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list images'
    return jsonError(message, 500)
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireTeamRoleApi()
  if ('error' in authResult) return authResult.error

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return jsonError('Image file is required')
    }

    const alt = formData.get('alt')
    const image = await uploadImageToR2AndDB({
      file,
      alt: typeof alt === 'string' ? alt : null,
      uploadedBy: authResult.user.id,
    })

    return NextResponse.json({ image }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload image'
    const status = message.includes('not configured') ? 503 : 400
    return jsonError(message, status)
  }
}
