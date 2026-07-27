import { auth } from '@/lib/auth/server'
import { enforceApiRateLimit } from '@/lib/api-rate-limit'
import type { NextRequest } from 'next/server'

const handler = auth.handler()

type RouteContext = { params: Promise<{ path: string[] }> }

async function withAuthRateLimit(
  request: NextRequest,
  context: RouteContext,
  method: 'GET' | 'POST',
) {
  const limited = enforceApiRateLimit(request, {
    scope: 'auth',
    limit: 20,
    windowMs: 60_000,
  })
  if (limited) return limited

  return method === 'GET'
    ? handler.GET(request, context)
    : handler.POST(request, context)
}

export async function GET(request: NextRequest, context: RouteContext) {
  return withAuthRateLimit(request, context, 'GET')
}

export async function POST(request: NextRequest, context: RouteContext) {
  return withAuthRateLimit(request, context, 'POST')
}
