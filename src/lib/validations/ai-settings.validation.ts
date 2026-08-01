import { z } from 'zod'

const pricePer1M = z
  .string()
  .trim()
  .refine((v) => v === '' || (Number.isFinite(Number(v)) && Number(v) >= 0), {
    message: 'Enter a number like 0.30, or leave blank',
  })

export const aiSettingsFormSchema = z.object({
  provider: z.enum(['openai', 'gemini']),
  openaiApiKey: z.string().trim(),
  openaiChatModel: z.string().trim(),
  geminiApiKey: z.string().trim(),
  geminiChatModel: z.string().trim(),
  openaiInputPricePer1M: pricePer1M,
  openaiOutputPricePer1M: pricePer1M,
  geminiInputPricePer1M: pricePer1M,
  geminiOutputPricePer1M: pricePer1M,
})

export const aiSettingsSubmissionSchema = aiSettingsFormSchema
