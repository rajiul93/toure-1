/**
 * Resolves the Neon Auth environment configuration.
 *
 * This intentionally throws rather than falling back to a placeholder: a
 * committed default cookie secret is a publicly known signing key, which would
 * let anyone forge a session cookie (including `role: 'admin'`). Failing to
 * boot is the safe outcome.
 */

/** Neon Auth signs cookies with this; anything shorter is trivially brute-forced. */
export const MIN_COOKIE_SECRET_LENGTH = 32

export type AuthEnv = {
  baseUrl: string
  cookieSecret: string
}

/** Only the keys we read; the index signature lets `process.env` satisfy it. */
export type AuthEnvSource = {
  NEON_AUTH_BASE_URL?: string
  NEON_AUTH_COOKIE_SECRET?: string
  [key: string]: string | undefined
}

export function resolveAuthEnv(env: AuthEnvSource = process.env): AuthEnv {
  const baseUrl = env.NEON_AUTH_BASE_URL?.trim()
  const cookieSecret = env.NEON_AUTH_COOKIE_SECRET?.trim()

  const missing: string[] = []
  if (!baseUrl) missing.push('NEON_AUTH_BASE_URL')
  if (!cookieSecret) missing.push('NEON_AUTH_COOKIE_SECRET')

  if (missing.length > 0) {
    throw new Error(
      `[auth] Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Refusing to start with an insecure placeholder.',
    )
  }

  // Never include the value itself in the message — this surfaces in logs.
  if (cookieSecret!.length < MIN_COOKIE_SECRET_LENGTH) {
    throw new Error(
      `[auth] NEON_AUTH_COOKIE_SECRET must be at least ${MIN_COOKIE_SECRET_LENGTH} characters ` +
        `(got ${cookieSecret!.length}). Generate one with: openssl rand -base64 32`,
    )
  }

  return { baseUrl: baseUrl!, cookieSecret: cookieSecret! }
}
