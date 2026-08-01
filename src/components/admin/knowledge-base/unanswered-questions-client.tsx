'use client'

import {
  fetchUnansweredQuestions,
  markUnansweredQuestionResolved,
} from '@/lib/admin-unanswered-questions-api'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

export default function UnansweredQuestionsClient() {
  const router = useRouter()
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchUnansweredQuestions({ resolved: false })
      setQuestions(result || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  const handleAddToKb = (question: string) => {
    const encodedQuestion = encodeURIComponent(question)
    router.push(`/admin/knowledge-base/new?question=${encodedQuestion}`)
  }

  const handleMarkResolved = async (id: string) => {
    try {
      await markUnansweredQuestionResolved(id)
      loadQuestions()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark as resolved')
    }
  }

  if (loading) {
    return <div className="text-center text-zinc-500">Loading questions...</div>
  }

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
  }

  return (
    <div className="space-y-4">
      {questions.length === 0 ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          No unanswered questions! Your knowledge base is comprehensive.
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 hover:shadow-sm"
            >
              <p className="font-semibold text-zinc-900">{q.question}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {q.tourSlug && (
                  <span className="inline-block rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                    {q.tourSlug}
                  </span>
                )}
                <span className="inline-block rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                  {new Date(q.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleAddToKb(q.question)}
                  className="rounded bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover"
                >
                  Add to Knowledge Base
                </button>
                <button
                  onClick={() => handleMarkResolved(q.id)}
                  className="rounded border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link href="/admin/knowledge-base" className="text-sm text-primary hover:underline">
          ← Back to Knowledge Base
        </Link>
      </div>
    </div>
  )
}
