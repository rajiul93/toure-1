import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import {
  getTourSettingsFormFromDB,
  saveTourSettingsToDB,
} from '@/lib/services/tour-settings.service'
import { tourSettingsSchema } from '@/lib/validations/tour-settings.validation'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const TOUR_SETTINGS_ROLES = ['admin', 'manager'] as const

export async function GET() {
  const authResult = await requireTeamRoleApi([...TOUR_SETTINGS_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const settings = await getTourSettingsFormFromDB()
    return NextResponse.json({ settings })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load tour settings'
    return jsonError(message, 500)
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireTeamRoleApi([...TOUR_SETTINGS_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const body = await request.json()
    const parsed = tourSettingsSchema.safeParse(body)

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid tour settings')
    }

    const config = await saveTourSettingsToDB(parsed.data, authResult.user.id)
    revalidateTag('tour-config', { expire: 0 })

    return NextResponse.json({
      settings: parsed.data,
      config,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save tour settings'
    return jsonError(message, 500)
  }
}
