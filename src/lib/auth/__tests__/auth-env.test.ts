import { MIN_COOKIE_SECRET_LENGTH, resolveAuthEnv } from '@/lib/auth/auth-env'

const VALID_SECRET = 'a'.repeat(MIN_COOKIE_SECRET_LENGTH)
const VALID_BASE_URL = 'https://auth.example.com/auth'

describe('resolveAuthEnv', () => {
  it('returns the config when both vars are present and strong', () => {
    expect(
      resolveAuthEnv({
        NEON_AUTH_BASE_URL: VALID_BASE_URL,
        NEON_AUTH_COOKIE_SECRET: VALID_SECRET,
      }),
    ).toEqual({ baseUrl: VALID_BASE_URL, cookieSecret: VALID_SECRET })
  })

  it('throws instead of falling back when the cookie secret is missing', () => {
    expect(() =>
      resolveAuthEnv({
        NEON_AUTH_BASE_URL: VALID_BASE_URL,
        NEON_AUTH_COOKIE_SECRET: undefined,
      }),
    ).toThrow(/NEON_AUTH_COOKIE_SECRET/)
  })

  it('throws when the base url is missing', () => {
    expect(() =>
      resolveAuthEnv({
        NEON_AUTH_BASE_URL: undefined,
        NEON_AUTH_COOKIE_SECRET: VALID_SECRET,
      }),
    ).toThrow(/NEON_AUTH_BASE_URL/)
  })

  it('reports every missing variable at once', () => {
    expect(() => resolveAuthEnv({})).toThrow(
      /NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET/,
    )
  })

  it('treats blank/whitespace values as missing', () => {
    expect(() =>
      resolveAuthEnv({
        NEON_AUTH_BASE_URL: VALID_BASE_URL,
        NEON_AUTH_COOKIE_SECRET: '   ',
      }),
    ).toThrow(/NEON_AUTH_COOKIE_SECRET/)
  })

  it('rejects a cookie secret that is too short to be safe', () => {
    expect(() =>
      resolveAuthEnv({
        NEON_AUTH_BASE_URL: VALID_BASE_URL,
        NEON_AUTH_COOKIE_SECRET: 'short-secret',
      }),
    ).toThrow(/at least 32 characters/)
  })

  it('never echoes the secret value in the error message', () => {
    const secret = 'super-secret-value-that-must-not-leak'
    try {
      resolveAuthEnv({
        NEON_AUTH_BASE_URL: undefined,
        NEON_AUTH_COOKIE_SECRET: secret,
      })
      throw new Error('expected resolveAuthEnv to throw')
    } catch (error) {
      expect((error as Error).message).not.toContain(secret)
    }
  })

  it('no longer accepts the old committed placeholder as a real secret', () => {
    // Regression guard for the original vulnerability: this exact string used
    // to be the silent fallback, making the signing key publicly known.
    const placeholder = 'development-placeholder-secret-minimum-32-characters'
    const resolved = resolveAuthEnv({
      NEON_AUTH_BASE_URL: VALID_BASE_URL,
      NEON_AUTH_COOKIE_SECRET: placeholder,
    })
    // It may only be used if an operator explicitly set it — never injected.
    expect(resolved.cookieSecret).toBe(placeholder)
    expect(() =>
      resolveAuthEnv({ NEON_AUTH_BASE_URL: VALID_BASE_URL }),
    ).toThrow()
  })
})
