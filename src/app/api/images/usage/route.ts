import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import {
  registerImageUsageInDB,
  unregisterImageUsageFromDB,
} from '@/lib/services/image.service'
import { registerImageUsageSchema } from '@/lib/validations/image.validation'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const authResult = await requireTeamRoleApi()
  if ('error' in authResult) return authResult.error

  try {
    const body = await request.json()
    const parsed = registerImageUsageSchema.safeParse(body)

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid request body')
    }

    const usage = await registerImageUsageInDB(parsed.data)

    return NextResponse.json({ usage }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to register image usage'

    if (message === 'Image not found') {
      return jsonError(message, 404)
    }

    return jsonError(message, 500)
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireTeamRoleApi()
  if ('error' in authResult) return authResult.error

  try {
    const body = await request.json()
    const parsed = registerImageUsageSchema.safeParse(body)

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid request body')
    }

    await unregisterImageUsageFromDB(parsed.data)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to unregister image usage'
    return jsonError(message, 500)
  }
}
