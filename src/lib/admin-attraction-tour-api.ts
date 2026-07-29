import type { AdminAttractionTourListItem } from '@/lib/services/attraction-tour.service'
import type { AttractionTourFormValues } from '@/lib/validations/attraction-tour.validation'

export type AdminAttractionTourList = {
  items: AdminAttractionTourListItem[]
  page: number
  limit: number
  total: number
  totalPages: number
}

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string }
    return data.error ?? fallback
  } catch {
    return fallback
  }
}

export async function listAdminAttractionTours(
  params: { page?: number; search?: string } = {},
): Promise<AdminAttractionTourList> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.search) query.set('search', params.search)

  const response = await fetch(`/api/admin/attraction-tours?${query.toString()}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to load tours'))
  }

  return response.json()
}

export async function getAdminAttractionTour(
  id: string,
): Promise<AttractionTourFormValues> {
  const response = await fetch(`/api/admin/attraction-tours/${id}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to load tour'))
  }

  const data = (await response.json()) as { tour: AttractionTourFormValues }
  return data.tour
}

export async function saveAdminAttractionTour(
  mode: 'create' | 'update',
  tourId: string,
  values: AttractionTourFormValues,
): Promise<{ id: string; slug: string; form: AttractionTourFormValues }> {
  const response = await fetch(
    mode === 'create'
      ? '/api/admin/attraction-tours'
      : `/api/admin/attraction-tours/${tourId}`,
    {
      method: mode === 'create' ? 'POST' : 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    },
  )

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to save tour'))
  }

  const data = (await response.json()) as {
    tour: { id: string; slug: string; form: AttractionTourFormValues }
  }
  return data.tour
}

export async function toggleAdminAttractionTourPublished(
  id: string,
  isPublished: boolean,
): Promise<void> {
  const response = await fetch(`/api/admin/attraction-tours/${id}/publish`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isPublished }),
  })

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to update publish status'))
  }
}

export async function deleteAdminAttractionTour(id: string): Promise<void> {
  const response = await fetch(`/api/admin/attraction-tours/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to delete tour'))
  }
}
