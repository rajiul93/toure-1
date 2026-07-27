/**
 * Lightweight in-memory rate limiter for API routes.
 * Resets on process restart — sufficient for a single-instance deploy;
 * swap for Redis/Upstash if you scale horizontally.
 */

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export type RateLimitOptions = {
  /** Unique scope, e.g. `auth:sign-in` */
  key: string
  /** Max requests per window */
  limit: number
  /** Window length in milliseconds */
  windowMs: number
}

export type RateLimitResult =
  | { ok: true; remaining: number; resetAt: number }
  | { ok: false; remaining: 0; resetAt: number }

export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(options.key)

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + options.windowMs
    buckets.set(options.key, { count: 1, resetAt })
    return { ok: true, remaining: options.limit - 1, resetAt }
  }

  if (existing.count >= options.limit) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return { ok: true, remaining: options.limit - existing.count, resetAt: existing.resetAt }
}

export function rateLimitHeaders(result: RateLimitResult, limit: number): HeadersInit {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  }
}

/** Derive a stable client key from proxy headers. */
export function clientRateLimitKey(request: Request, scope: string): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = request.headers.get('x-real-ip')?.trim()
  const ip = forwarded || realIp || 'unknown'
  return `${scope}:${ip}`
}
