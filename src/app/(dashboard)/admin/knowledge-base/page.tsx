import AdminKnowledgeBaseClient from '@/components/admin/knowledge-base/admin-knowledge-base-client'
import Link from 'next/link'

export const metadata = {
  title: 'Knowledge Base',
}

export default async function AdminKnowledgeBasePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <Link
          href="/admin/knowledge-base/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          + Add Entry
        </Link>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <AdminKnowledgeBaseClient />
      </div>
    </div>
  )
}
