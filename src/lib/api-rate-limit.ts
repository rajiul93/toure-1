import {
  checkRateLimit,
  clientRateLimitKey,
  rateLimitHeaders,
} from '@/lib/rate-limit'
import { NextResponse, type NextRequest } from 'next/server'

type RateLimitConfig = {
  scope: string
  limit: number
  windowMs: number
}

export function enforceApiRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
): NextResponse | null {
  const result = checkRateLimit({
    key: clientRateLimitKey(request, config.scope),
    limit: config.limit,
    windowMs: config.windowMs,
  })

  if (result.ok) return null

  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: rateLimitHeaders(result, config.limit),
    },
  )
}
