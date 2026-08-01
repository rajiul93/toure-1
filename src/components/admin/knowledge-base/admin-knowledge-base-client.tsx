'use client'

import {
  deleteKnowledgeBaseEntry,
  fetchKnowledgeBaseList,
  toggleKnowledgeBaseEntryPublished,
} from '@/lib/admin-knowledge-base-api'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminKnowledgeBaseClient() {
  const router = useRouter()
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEntries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchKnowledgeBaseList()
      setEntries(result.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const handleTogglePublished = async (id: string, isPublished: boolean) => {
    try {
      await toggleKnowledgeBaseEntryPublished(id, !isPublished)
      loadEntries()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  const handleDelete = async (id: string, question: string) => {
    if (!window.confirm(`Delete entry: "${question}"?`)) return

    try {
      await deleteKnowledgeBaseEntry(id)
      loadEntries()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  if (loading) {
    return <div className="text-center text-zinc-500">Loading entries...</div>
  }

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 text-left font-semibold text-zinc-900">Question</th>
              <th className="px-4 py-3 text-left font-semibold text-zinc-900">Category</th>
              <th className="px-4 py-3 text-left font-semibold text-zinc-900">Tour</th>
              <th className="px-4 py-3 text-center font-semibold text-zinc-900">Published</th>
              <th className="px-4 py-3 text-left font-semibold text-zinc-900">Updated</th>
              <th className="px-4 py-3 text-right font-semibold text-zinc-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No entries yet.{' '}
                  <Link href="/admin/knowledge-base/new" className="text-primary hover:underline">
                    Create one
                  </Link>
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="px-4 py-3 max-w-xs truncate text-zinc-900">{entry.question}</td>
                  <td className="px-4 py-3 text-zinc-600">{entry.category}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {entry.tourSlug || <span className="text-zinc-400">Site-wide</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleTogglePublished(entry.id, entry.isPublished)}
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        entry.isPublished
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {entry.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {new Date(entry.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/knowledge-base/${entry.id}`}
                        className="text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(entry.id, entry.question)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Link
          href="/admin/knowledge-base/unanswered"
          className="text-sm text-primary hover:underline"
        >
          View unanswered questions →
        </Link>
      </div>
    </div>
  )
}
