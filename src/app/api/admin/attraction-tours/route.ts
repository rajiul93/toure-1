import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import {
  createAttractionTourInDB,
  listAdminAttractionToursFromDB,
} from '@/lib/services/attraction-tour.service'
import { attractionTourSubmissionSchema } from '@/lib/validations/attraction-tour.validation'
import { revalidateAttractionTourPaths } from '@/lib/attraction-tour-revalidation'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const ADMIN_ROLES = ['admin'] as const

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().optional(),
})

export async function GET(request: NextRequest) {
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
  if ('error' in authResult) return authResult.error

  const parsed = listQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid query')
  }

  try {
    return NextResponse.json(await listAdminAttractionToursFromDB(parsed.data))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list tours'
    console.error('[GET /api/admin/attraction-tours]', error)
    return jsonError(message, 500)
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const parsed = attractionTourSubmissionSchema.safeParse(await request.json())

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid tour data')
    }

    const tour = await createAttractionTourInDB(parsed.data)
    revalidateAttractionTourPaths({ slug: tour.slug })
    return NextResponse.json({ tour }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create tour'
    return jsonError(message, message.includes('already exists') ? 409 : 500)
  }
}
