import type {
  knowledgeBaseFormSchema,
  knowledgeBaseSubmissionSchema,
} from '@/lib/validations/knowledge-base.validation'
import type { z } from 'zod'

type KnowledgeBaseFormValues = z.infer<typeof knowledgeBaseFormSchema>
type KnowledgeBaseSubmission = z.infer<typeof knowledgeBaseSubmissionSchema>
type KnowledgeBaseEntry = any

export async function fetchKnowledgeBaseList({
  page = 1,
  limit = 20,
  search,
  category,
  tourSlug,
}: {
  page?: number
  limit?: number
  search?: string
  category?: string
  tourSlug?: string | null
} = {}) {
  const params = new URLSearchParams()
  params.append('page', String(page))
  params.append('limit', String(limit))
  if (search) params.append('search', search)
  if (category) params.append('category', category)
  if (tourSlug) params.append('tourSlug', tourSlug)

  const response = await fetch(`/api/admin/knowledge-base?${params.toString()}`, {
    credentials: 'include',
  })

  const data = (await response.json().catch(() => ({}))) as {
    items?: KnowledgeBaseEntry[]
    total?: number
    page?: number
    limit?: number
    totalPages?: number
    error?: string
  }

  if (!response.ok || !data.items) {
    throw new Error(data.error ?? 'Failed to load knowledge base')
  }

  return data
}

export async function fetchKnowledgeBaseEntry(id: string): Promise<KnowledgeBaseEntry> {
  const response = await fetch(`/api/admin/knowledge-base/${id}`, {
    credentials: 'include',
  })

  const data = (await response.json().catch(() => ({}))) as {
    entry?: KnowledgeBaseEntry
    error?: string
  }

  if (!response.ok || !data.entry) {
    throw new Error(data.error ?? 'Failed to load entry')
  }

  return data.entry
}

export async function saveKnowledgeBaseEntry(
  values: KnowledgeBaseFormValues,
  id?: string,
): Promise<KnowledgeBaseEntry> {
  const method = id ? 'PATCH' : 'POST'
  const url = id ? `/api/admin/knowledge-base/${id}` : '/api/admin/knowledge-base'

  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  const data = (await response.json().catch(() => ({}))) as {
    entry?: KnowledgeBaseEntry
    error?: string
  }

  if (!response.ok || !data.entry) {
    throw new Error(data.error ?? `Failed to ${id ? 'update' : 'create'} entry`)
  }

  return data.entry
}

export async function deleteKnowledgeBaseEntry(id: string): Promise<boolean> {
  const response = await fetch(`/api/admin/knowledge-base/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean
    error?: string
  }

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? 'Failed to delete entry')
  }

  return true
}

export async function toggleKnowledgeBaseEntryPublished(
  id: string,
  isPublished: boolean,
): Promise<KnowledgeBaseEntry> {
  const response = await fetch(`/api/admin/knowledge-base/${id}/publish`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isPublished }),
  })

  const data = (await response.json().catch(() => ({}))) as {
    entry?: KnowledgeBaseEntry
    error?: string
  }

  if (!response.ok || !data.entry) {
    throw new Error(data.error ?? 'Failed to update publish status')
  }

  return data.entry
}
