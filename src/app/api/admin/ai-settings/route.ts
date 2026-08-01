import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import {
  getAiSettingsFromDB,
  saveAiSettingsToDB,
} from '@/lib/services/ai-settings.service'
import { aiSettingsSubmissionSchema } from '@/lib/validations/ai-settings.validation'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ADMIN_ROLES = ['admin'] as const

export async function GET(request: NextRequest) {
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const settings = await getAiSettingsFromDB()
    return NextResponse.json({ settings })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch settings'
    console.error('[GET /api/admin/ai-settings]', error)
    return jsonError(message, 500)
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const parsed = aiSettingsSubmissionSchema.safeParse(await request.json())

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid settings')
    }

    const settings = await saveAiSettingsToDB(parsed.data)
    revalidateTag('ai-settings', { expire: 0 })

    return NextResponse.json({ settings })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save settings'
    console.error('[PATCH /api/admin/ai-settings]', error)
    return jsonError(message, 500)
  }
}
