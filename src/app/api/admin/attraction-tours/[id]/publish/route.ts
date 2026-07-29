import { revalidateAttractionTourPaths } from '@/lib/attraction-tour-revalidation'
import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import {
  attractionTourExistsInDB,
  setAttractionTourPublishedInDB,
} from '@/lib/services/attraction-tour.service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const ADMIN_ROLES = ['admin'] as const

const publishSchema = z.object({ isPublished: z.boolean() })

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
  if ('error' in authResult) return authResult.error

  const { id } = await context.params

  try {
    if (!(await attractionTourExistsInDB(id))) return jsonError('Tour not found', 404)

    const parsed = publishSchema.safeParse(await request.json())
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid publish status')
    }

    const tour = await setAttractionTourPublishedInDB(id, parsed.data.isPublished)
    revalidateAttractionTourPaths({ slug: tour.slug })

    return NextResponse.json({ tour })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update publish status'
    return jsonError(message, 500)
  }
}
