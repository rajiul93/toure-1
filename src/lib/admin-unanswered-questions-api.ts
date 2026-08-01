type UnansweredQuestion = any

export async function fetchUnansweredQuestions({
  resolved,
}: {
  resolved?: boolean
} = {}) {
  const params = new URLSearchParams()
  if (resolved !== undefined) params.append('resolved', String(resolved))

  const response = await fetch(`/api/admin/unanswered-questions?${params.toString()}`, {
    credentials: 'include',
  })

  const data = (await response.json().catch(() => ({}))) as {
    questions?: UnansweredQuestion[]
    error?: string
  }

  if (!response.ok || !data.questions) {
    throw new Error(data.error ?? 'Failed to load questions')
  }

  return data.questions
}

export async function markUnansweredQuestionResolved(
  id: string,
  resolvedEntryId?: string | null,
): Promise<void> {
  const response = await fetch(`/api/admin/unanswered-questions/${id}/resolve`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resolvedEntryId }),
  })

  const data = (await response.json().catch(() => ({}))) as {
    result?: unknown
    error?: string
  }

  if (!response.ok) {
    throw new Error(data.error ?? 'Failed to mark as resolved')
  }
}
