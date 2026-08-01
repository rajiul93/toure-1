import AiSettingsForm from '@/components/admin/ai-settings/ai-settings-form'
import { getAiSettingsFromDB } from '@/lib/services/ai-settings.service'

export const metadata = {
  title: 'AI Settings',
}

export default async function AdminAISettingsPage() {
  const initialValues = await getAiSettingsFromDB()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">AI Settings</h1>
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <AiSettingsForm initialValues={initialValues} />
      </div>
    </div>
  )
}
