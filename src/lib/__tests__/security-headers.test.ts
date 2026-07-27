import {
  buildContentSecurityPolicy,
  buildSecurityHeaders,
} from '@/lib/security-headers'

const PROD = {
  NODE_ENV: 'production',
  R2_PUBLIC_URL: 'https://pub-abc123.r2.dev',
  NEON_AUTH_BASE_URL: 'https://tenant.neonauth.aws.neon.tech/auth',
}

function parse(csp: string): Record<string, string[]> {
  return Object.fromEntries(
    csp.split('; ').map((d) => {
      const [name, ...values] = d.trim().split(/\s+/)
      return [name, values]
    }),
  )
}

describe('buildContentSecurityPolicy', () => {
  it('locks down the directives that blunt an XSS foothold', () => {
    const csp = parse(buildContentSecurityPolicy(PROD))
    expect(csp['object-src']).toEqual(["'none'"])
    expect(csp['base-uri']).toEqual(["'self'"])
    expect(csp['form-action']).toEqual(["'self'"])
    expect(csp['frame-ancestors']).toEqual(["'none'"])
    expect(csp['default-src']).toEqual(["'self'"])
  })

  it('allows the Bokun widget to load its script and iframe', () => {
    const csp = parse(buildContentSecurityPolicy(PROD))
    expect(csp['script-src']).toEqual(
      expect.arrayContaining(['https://widgets.bokun.io', 'https://static.bokun.io']),
    )
    expect(csp['frame-src']).toEqual(
      expect.arrayContaining(['https://widgets.bokun.io']),
    )
    expect(csp['connect-src']).toEqual(
      expect.arrayContaining(['https://widgets.bokun.io']),
    )
  })

  it('allows Leaflet map tiles', () => {
    const csp = parse(buildContentSecurityPolicy(PROD))
    expect(csp['connect-src']).toContain('https://*.tile.openstreetmap.org')
    expect(csp['img-src']).toContain('https:')
  })

  it('derives the R2 and auth origins from env', () => {
    const csp = parse(buildContentSecurityPolicy(PROD))
    expect(csp['connect-src']).toContain('https://pub-abc123.r2.dev')
    expect(csp['connect-src']).toContain('https://tenant.neonauth.aws.neon.tech')
  })

  it('omits unparseable or missing origins instead of emitting garbage', () => {
    const csp = buildContentSecurityPolicy({
      NODE_ENV: 'production',
      R2_PUBLIC_URL: 'not-a-url',
      NEON_AUTH_BASE_URL: undefined,
    })
    expect(csp).not.toContain('not-a-url')
    expect(csp).not.toContain('undefined')
    expect(csp).not.toContain('null')
  })

  it('does not allow unsafe-eval in production', () => {
    expect(buildContentSecurityPolicy(PROD)).not.toContain("'unsafe-eval'")
  })

  it('allows unsafe-eval in development only (React Refresh)', () => {
    expect(buildContentSecurityPolicy({ NODE_ENV: 'development' })).toContain(
      "'unsafe-eval'",
    )
  })

  it('upgrades insecure requests only in production', () => {
    expect(buildContentSecurityPolicy(PROD)).toContain('upgrade-insecure-requests')
    expect(buildContentSecurityPolicy({ NODE_ENV: 'development' })).not.toContain(
      'upgrade-insecure-requests',
    )
  })
})

describe('buildSecurityHeaders', () => {
  const names = (env: Parameters<typeof buildSecurityHeaders>[0]) =>
    buildSecurityHeaders(env).map((h) => h.key)

  it('emits the expected header set in production', () => {
    expect(names(PROD)).toEqual(
      expect.arrayContaining([
        'Content-Security-Policy',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'Referrer-Policy',
        'Permissions-Policy',
        'Strict-Transport-Security',
      ]),
    )
  })

  it('sets nosniff and DENY', () => {
    const headers = Object.fromEntries(
      buildSecurityHeaders(PROD).map((h) => [h.key, h.value]),
    )
    expect(headers['X-Content-Type-Options']).toBe('nosniff')
    expect(headers['X-Frame-Options']).toBe('DENY')
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
  })

  it('never sends HSTS from a development server', () => {
    expect(names({ NODE_ENV: 'development' })).not.toContain(
      'Strict-Transport-Security',
    )
  })

  it('returns header entries shaped for next.config headers()', () => {
    for (const header of buildSecurityHeaders(PROD)) {
      expect(typeof header.key).toBe('string')
      expect(typeof header.value).toBe('string')
      expect(header.value.length).toBeGreaterThan(0)
    }
  })
})
