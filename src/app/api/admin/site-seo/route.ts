import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import {
  getSiteSeoSettingsFormFromDB,
  saveSiteSeoSettingsToDB,
} from '@/lib/services/site-seo.service'
import { siteSeoSettingsSchema } from '@/lib/validations/site-seo.validation'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SEO_SETTINGS_ROLES = ['admin', 'manager'] as const

export async function GET() {
  const authResult = await requireTeamRoleApi([...SEO_SETTINGS_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const settings = await getSiteSeoSettingsFormFromDB()
    return NextResponse.json({ settings })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load SEO settings'
    return jsonError(message, 500)
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireTeamRoleApi([...SEO_SETTINGS_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const body = await request.json()
    const parsed = siteSeoSettingsSchema.safeParse(body)

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid SEO settings')
    }

    const config = await saveSiteSeoSettingsToDB(parsed.data, authResult.user.id)
    revalidateTag('site-seo', { expire: 0 })

    return NextResponse.json({
      settings: parsed.data,
      config,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save SEO settings'
    return jsonError(message, 500)
  }
}
