import UnansweredQuestionsClient from '@/components/admin/knowledge-base/unanswered-questions-client'

export const metadata = {
  title: 'Unanswered Questions',
}

export default async function UnansweredQuestionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Unanswered Questions</h1>
      <p className="text-zinc-600">
        These are questions visitors asked that the AI couldn't answer from the knowledge base.
        Review them and add answers to improve your coverage.
      </p>
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <UnansweredQuestionsClient />
      </div>
    </div>
  )
}
