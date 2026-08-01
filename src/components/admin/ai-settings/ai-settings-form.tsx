'use client'

import { aiSettingsFormSchema } from '@/lib/validations/ai-settings.validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { saveAiSettings } from '@/lib/admin-ai-settings-api'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'
import { toast } from 'sonner'

type FormValues = z.infer<typeof aiSettingsFormSchema>

export default function AiSettingsForm({
  initialValues,
}: {
  initialValues: FormValues
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(aiSettingsFormSchema),
    defaultValues: initialValues,
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setError(null)

    try {
      await saveAiSettings(data)
      toast.success('Settings saved successfully')
      router.refresh()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save settings'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="font-semibold text-heading">AI Provider</h3>
        <p className="mt-1 text-sm text-zinc-600">Choose which AI provider to use</p>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="openai"
              {...register('provider')}
              className="rounded border"
            />
            <span className="text-sm font-medium text-heading">ChatGPT (OpenAI)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="gemini"
              {...register('provider')}
              className="rounded border"
            />
            <span className="text-sm font-medium text-heading">Gemini (Google)</span>
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="font-semibold text-heading">OpenAI Configuration</h3>
        <p className="mt-1 text-sm text-zinc-600">
          Get your API key from{' '}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            OpenAI Platform
          </a>
        </p>
      </div>

      <div>
        <label htmlFor="openaiApiKey" className="block text-sm font-semibold text-heading">
          API Key
        </label>
        <div className="relative mt-2">
          <input
            id="openaiApiKey"
            type={showApiKey ? 'text' : 'password'}
            placeholder="sk-..."
            {...register('openaiApiKey')}
            className="block w-full rounded-lg border border-zinc-300 px-4 py-2 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
            aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
          >
            {showApiKey ? (
              <FaEyeSlash className="size-4" />
            ) : (
              <FaEye className="size-4" />
            )}
          </button>
        </div>
        {errors.openaiApiKey && (
          <p className="mt-1 text-sm text-red-600">{errors.openaiApiKey.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="openaiChatModel" className="block text-sm font-semibold text-heading">
          Chat Model
        </label>
        <input
          id="openaiChatModel"
          type="text"
          placeholder="gpt-4o-mini (default)"
          {...register('openaiChatModel')}
          className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Leave blank to use the default (gpt-4o-mini). Common options: gpt-4o-mini, gpt-4o,
          gpt-4-turbo.
        </p>
        {errors.openaiChatModel && (
          <p className="mt-1 text-sm text-red-600">{errors.openaiChatModel.message}</p>
        )}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="font-semibold text-heading">Google Gemini Configuration</h3>
        <p className="mt-1 text-sm text-zinc-600">
          Get your API key from{' '}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google AI Studio
          </a>
        </p>
      </div>

      <div>
        <label htmlFor="geminiApiKey" className="block text-sm font-semibold text-heading">
          API Key
        </label>
        <div className="relative mt-2">
          <input
            id="geminiApiKey"
            type={showApiKey ? 'text' : 'password'}
            placeholder="AIza..."
            {...register('geminiApiKey')}
            className="block w-full rounded-lg border border-zinc-300 px-4 py-2 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
            aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
          >
            {showApiKey ? (
              <FaEyeSlash className="size-4" />
            ) : (
              <FaEye className="size-4" />
            )}
          </button>
        </div>
        {errors.geminiApiKey && (
          <p className="mt-1 text-sm text-red-600">{errors.geminiApiKey.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="geminiChatModel" className="block text-sm font-semibold text-heading">
          Chat Model
        </label>
        <input
          id="geminiChatModel"
          type="text"
          placeholder="gemini-flash-lite-latest (default)"
          {...register('geminiChatModel')}
          className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Leave blank to use the default (gemini-flash-lite-latest) — it uses about half
          the tokens of gemini-flash-latest with the same answers. Note: older names like
          gemini-2.0-flash have no free-tier quota and will fail with a 429.
        </p>
        {errors.geminiChatModel && (
          <p className="mt-1 text-sm text-red-600">{errors.geminiChatModel.message}</p>
        )}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="font-semibold text-heading">Token Pricing (optional)</h3>
        <p className="mt-1 text-sm text-zinc-600">
          Price in USD per 1,000,000 tokens, used only to estimate cost on the{' '}
          <a href="/admin/ai-usage" className="text-primary hover:underline">
            AI Usage
          </a>{' '}
          page. Leave blank to show token counts without a cost estimate. Check current
          rates on your provider&apos;s pricing page and update here when they change.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            ['openaiInputPricePer1M', 'OpenAI — input / 1M', '0.15'],
            ['openaiOutputPricePer1M', 'OpenAI — output / 1M', '0.60'],
            ['geminiInputPricePer1M', 'Gemini — input / 1M', '0.10'],
            ['geminiOutputPricePer1M', 'Gemini — output / 1M', '0.40'],
          ] as const
        ).map(([name, label, placeholder]) => (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-semibold text-heading">
              {label}
            </label>
            <input
              id={name}
              type="text"
              inputMode="decimal"
              placeholder={`e.g. ${placeholder}`}
              {...register(name)}
              className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors[name] && (
              <p className="mt-1 text-sm text-red-600">{errors[name]?.message}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}
