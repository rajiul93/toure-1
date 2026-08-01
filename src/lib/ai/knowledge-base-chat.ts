import { getAiSettingsFromDB } from '@/lib/services/ai-settings.service'
import { listPublishedKnowledgeBaseForChat } from '@/lib/services/knowledge-base.service'
import { logUnansweredQuestionInDB } from '@/lib/services/unanswered-question.service'
import { logAiUsageInDB } from '@/lib/services/ai-usage.service'
import type { AiSettingsInput, AiProvider } from '@/lib/ai-settings.types'
import { OpenAI } from 'openai'

const UNANSWERED_FALLBACK_TEXT = "I'm an AI assistant and I don't have the answer to that right now — please hold on, our team will follow up with you shortly."

class ProviderError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ProviderError'
    this.status = status
  }
}

function buildSystemPrompt(
  rows: Awaited<ReturnType<typeof listPublishedKnowledgeBaseForChat>>,
  options?: { tourSlug?: string },
): string {
  // Site-wide entries apply everywhere; a tour's entries apply only on that
  // tour. Filtering unconditionally matters off tour pages too — otherwise the
  // home page would be offered every tour's answers and could reply about a
  // tour the visitor is not looking at.
  const filteredRows = rows.filter(
    (r) => r.tourSlug === null || r.tourSlug === options?.tourSlug,
  )

  const grouped = new Map<string, typeof rows>()
  for (const row of filteredRows) {
    const key = row.category
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(row)
  }

  let context = `You are an AI assistant for a tour company. Answer ONLY based on the knowledge base provided below. Never use outside knowledge or invent prices, hours, addresses, or policies not present in the context.

If the visitor's question is not covered by the knowledge base, respond with this exact text:
"${UNANSWERED_FALLBACK_TEXT}"

Keep answers short, friendly, and on-brand.

---

KNOWLEDGE BASE BY CATEGORY:

`

  for (const [category, items] of grouped) {
    context += `\n## ${category}\n`
    for (const item of items) {
      context += `Q: ${item.question}\nA: ${item.answer}\n\n`
    }
  }

  return context
}

type ProviderReply = {
  text: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

async function callGemini(
  systemPrompt: string,
  question: string,
  settings: AiSettingsInput,
): Promise<ProviderReply> {
  // flash-lite spends no "thinking" tokens, which halves total usage on a
  // grounded KB lookup while producing the same answers (verified 4/4 on
  // off-KB questions still emitting the exact fallback string).
  const model = settings.geminiChatModel || 'gemini-flash-lite-latest'
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: question }] }],
        generationConfig: { temperature: 0.2 },
      }),
    },
  )
  if (!res.ok) throw new ProviderError(`Gemini API error: ${res.status}`, res.status)
  const data = await res.json()
  const usage = data.usageMetadata ?? {}

  return {
    text: data.candidates?.[0]?.content?.parts?.[0]?.text ?? '',
    model,
    promptTokens: usage.promptTokenCount ?? 0,
    completionTokens: usage.candidatesTokenCount ?? 0,
    totalTokens: usage.totalTokenCount ?? 0,
  }
}

async function callOpenAI(
  systemPrompt: string,
  question: string,
  settings: AiSettingsInput,
): Promise<ProviderReply> {
  const client = new OpenAI({
    apiKey: settings.openaiApiKey,
  })

  const model = settings.openaiChatModel || 'gpt-4o-mini'
  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: question,
      },
    ],
  })

  return {
    text: response.choices[0]?.message?.content || '',
    model,
    promptTokens: response.usage?.prompt_tokens ?? 0,
    completionTokens: response.usage?.completion_tokens ?? 0,
    totalTokens: response.usage?.total_tokens ?? 0,
  }
}

async function callProvider(
  provider: AiProvider,
  systemPrompt: string,
  question: string,
  settings: AiSettingsInput,
): Promise<ProviderReply> {
  if (provider === 'gemini') {
    return callGemini(systemPrompt, question, settings)
  } else {
    return callOpenAI(systemPrompt, question, settings)
  }
}

export type AnswerStatus = 'answered' | 'unresolved' | 'not_configured' | 'error'

export async function answerFromKnowledgeBase(
  question: string,
  context?: { tourSlug?: string },
): Promise<{ answer: string; status: AnswerStatus }> {
  const settings = await getAiSettingsFromDB()

  const activeKey =
    settings.provider === 'gemini' ? settings.geminiApiKey : settings.openaiApiKey

  if (!activeKey) {
    return {
      answer: "AI assistant isn't set up yet — please contact us on WhatsApp",
      status: 'not_configured',
    }
  }

  try {
    const rows = await listPublishedKnowledgeBaseForChat()
    const systemPrompt = buildSystemPrompt(rows, { tourSlug: context?.tourSlug })

    let reply: ProviderReply
    let servedBy: AiProvider = settings.provider

    try {
      reply = await callProvider(settings.provider, systemPrompt, question, settings)
    } catch (providerError) {
      const isRateLimit =
        providerError instanceof ProviderError && providerError.status === 429
      const isOpenAIRateLimit =
        providerError instanceof Error &&
        'status' in providerError &&
        providerError.status === 429

      if ((isRateLimit || isOpenAIRateLimit) && settings.provider === 'gemini') {
        const fallbackProvider: AiProvider = 'openai'
        const fallbackKey = settings.openaiApiKey

        if (fallbackKey) {
          console.warn(
            '[answerFromKnowledgeBase] Gemini rate-limited (429), falling back to OpenAI',
          )
          reply = await callProvider(fallbackProvider, systemPrompt, question, settings)
          servedBy = fallbackProvider
        } else {
          throw providerError
        }
      } else if ((isRateLimit || isOpenAIRateLimit) && settings.provider === 'openai') {
        const fallbackProvider: AiProvider = 'gemini'
        const fallbackKey = settings.geminiApiKey

        if (fallbackKey) {
          console.warn(
            '[answerFromKnowledgeBase] OpenAI rate-limited (429), falling back to Gemini',
          )
          reply = await callProvider(fallbackProvider, systemPrompt, question, settings)
          servedBy = fallbackProvider
        } else {
          throw providerError
        }
      } else {
        throw providerError
      }
    }

    const isUnresolved = !reply.text || reply.text === UNANSWERED_FALLBACK_TEXT
    const status: AnswerStatus = isUnresolved ? 'unresolved' : 'answered'

    console.info(
      `[ai-usage] provider=${servedBy} model=${reply.model} kbEntries=${rows.length} ` +
        `promptTokens=${reply.promptTokens} completionTokens=${reply.completionTokens} ` +
        `totalTokens=${reply.totalTokens}`,
    )

    // Usage bookkeeping must never take down a working answer.
    await logAiUsageInDB({
      provider: servedBy,
      model: reply.model,
      promptTokens: reply.promptTokens,
      completionTokens: reply.completionTokens,
      totalTokens: reply.totalTokens,
      status,
      question,
      tourSlug: context?.tourSlug,
    }).catch((err) => console.error('[ai-usage] failed to record usage:', err))

    if (isUnresolved) {
      await logUnansweredQuestionInDB({
        question,
        tourSlug: context?.tourSlug,
      })

      return {
        answer: UNANSWERED_FALLBACK_TEXT,
        status: 'unresolved',
      }
    }

    return {
      answer: reply.text,
      status: 'answered',
    }
  } catch (error) {
    console.error('[answerFromKnowledgeBase] Error:', error)
    return {
      answer: "Having trouble right now — please try reaching us on WhatsApp",
      status: 'error',
    }
  }
}
