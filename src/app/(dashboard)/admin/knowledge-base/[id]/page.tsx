import KnowledgeBaseForm from '@/components/admin/knowledge-base/knowledge-base-form'
import { getKnowledgeBaseEntryFromDB } from '@/lib/services/knowledge-base.service'
import { listTourSlugOptionsFromDB } from '@/lib/services/attraction-tour.service'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Knowledge Base Entry',
}

export default async function AdminKnowledgeBaseEntryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const isNew = id === 'new'

  const [entryResult, tourOptions] = await Promise.all([
    isNew ? Promise.resolve(null) : getKnowledgeBaseEntryFromDB(id),
    listTourSlugOptionsFromDB(),
  ])

  if (!isNew && !entryResult) {
    notFound()
  }

  // tourSlug is nullable in the database but the form field is always a string,
  // where "" means site-wide.
  const entry: any = entryResult
    ? { ...entryResult, tourSlug: entryResult.tourSlug ?? '' }
    : null

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{isNew ? 'Add Entry' : 'Edit Entry'}</h1>
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <KnowledgeBaseForm entry={entry} isNew={isNew} tourOptions={tourOptions} />
      </div>
    </div>
  )
}
