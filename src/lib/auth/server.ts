import { createNeonAuth } from '@neondatabase/auth/next/server'

const baseUrl = process.env.NEON_AUTH_BASE_URL
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET

if (!baseUrl || !cookieSecret) {
  console.warn(
    '[auth] NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET are required at runtime.',
  )
}

export const auth = createNeonAuth({
  baseUrl: baseUrl ?? 'https://placeholder.neonauth.local/auth',
  cookies: {
    secret:
      cookieSecret ??
      'development-placeholder-secret-minimum-32-characters',
  },
})
