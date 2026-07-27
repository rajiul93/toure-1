import { createNeonAuth } from '@neondatabase/auth/next/server'
import { resolveAuthEnv } from '@/lib/auth/auth-env'

// Throws if the auth environment is missing or weak. See auth-env.ts for why
// there is deliberately no fallback.
const { baseUrl, cookieSecret } = resolveAuthEnv()

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
  },
})
