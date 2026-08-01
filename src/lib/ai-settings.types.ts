export type AiProvider = 'openai' | 'gemini'

export type AiSettingsInput = {
  provider: AiProvider
  openaiApiKey: string
  openaiChatModel: string
  geminiApiKey: string
  geminiChatModel: string
  // Price per 1,000,000 tokens in USD, kept as free text so a blank value means
  // "don't show a cost estimate" rather than a misleading $0.
  openaiInputPricePer1M: string
  openaiOutputPricePer1M: string
  geminiInputPricePer1M: string
  geminiOutputPricePer1M: string
}

export function getDefaultAiSettings(): AiSettingsInput {
  return {
    provider: 'openai',
    openaiApiKey: '',
    openaiChatModel: '',
    geminiApiKey: '',
    geminiChatModel: '',
    openaiInputPricePer1M: '',
    openaiOutputPricePer1M: '',
    geminiInputPricePer1M: '',
    geminiOutputPricePer1M: '',
  }
}

/** Numeric price per 1M tokens, or null when unset/invalid so callers hide cost. */
export function parsePricePer1M(value: string | undefined): number | null {
  if (!value || !value.trim()) return null
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : null
}
