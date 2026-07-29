import { jsonError, requireTeamRoleApi } from '@/lib/auth/require-role-api'
import {
  getAttractionTourFromDB,
  softDeleteAttractionTourInDB,
  updateAttractionTourInDB,
} from '@/lib/services/attraction-tour.service'
import { attractionTourSubmissionSchema } from '@/lib/validations/attraction-tour.validation'
import { revalidateAttractionTourPaths } from '@/lib/attraction-tour-revalidation'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ADMIN_ROLES = ['admin'] as const

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const { id } = await params
    const tour = await getAttractionTourFromDB(id)
    if (!tour) return jsonError('Tour not found', 404)
    return NextResponse.json({ tour })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load tour'
    return jsonError(message, 500)
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const { id } = await params
    const previous = await getAttractionTourFromDB(id)
    if (!previous) return jsonError('Tour not found', 404)

    const parsed = attractionTourSubmissionSchema.safeParse(await request.json())
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid tour data')
    }

    const tour = await updateAttractionTourInDB(id, parsed.data)
    revalidateAttractionTourPaths({ slug: tour.slug, previousSlug: previous.slug })
    return NextResponse.json({ tour })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update tour'
    return jsonError(message, message.includes('already exists') ? 409 : 500)
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const authResult = await requireTeamRoleApi([...ADMIN_ROLES])
  if ('error' in authResult) return authResult.error

  try {
    const { id } = await params
    const existing = await getAttractionTourFromDB(id)
    if (!existing) return jsonError('Tour not found', 404)

    await softDeleteAttractionTourInDB(id)
    revalidateAttractionTourPaths({ slug: existing.slug })
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete tour'
    return jsonError(message, 500)
  }
}
