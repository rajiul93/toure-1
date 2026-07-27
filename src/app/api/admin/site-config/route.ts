import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import {
  getSiteSettingsFormFromDB,
  saveSiteSettingsToDB,
} from '@/lib/services/site-settings.service'
import { siteSettingsSchema } from '@/lib/validations/site-settings.validation'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SITE_SETTINGS_ROLES = ['admin', 'manager'] as const

export async function GET() {
  const authResult = await requireTeamRoleApi([...SITE_SETTINGS_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const settings = await getSiteSettingsFormFromDB()
    return NextResponse.json({ settings })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load site settings'
    return jsonError(message, 500)
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireTeamRoleApi([...SITE_SETTINGS_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const body = await request.json()
    const parsed = siteSettingsSchema.safeParse(body)

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid site settings')
    }

    const config = await saveSiteSettingsToDB(parsed.data, authResult.user.id)
    revalidateTag('site-config', { expire: 0 })

    return NextResponse.json({
      settings: parsed.data,
      config,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save site settings'
    return jsonError(message, 500)
  }
}
