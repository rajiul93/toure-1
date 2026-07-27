/**
 * Security response headers.
 *
 * Kept as a pure function so the policy can be unit-tested without booting
 * Next.js. Consumed by `next.config.ts`.
 */

export type SecurityHeaderEnv = {
  NODE_ENV?: string
  R2_PUBLIC_URL?: string
  NEON_AUTH_BASE_URL?: string
  [key: string]: string | undefined
}

export type HeaderEntry = { key: string; value: string }

/** Bókun serves the booking widget loader, its chunks, and the calendar iframe. */
const BOKUN_ORIGINS = ['https://widgets.bokun.io', 'https://static.bokun.io']
/** Leaflet basemap tiles on the meeting-point map. */
const TILE_ORIGINS = ['https://*.tile.openstreetmap.org']

function originOf(rawUrl: string | undefined): string | null {
  if (!rawUrl?.trim()) return null
  try {
    return new URL(rawUrl.trim()).origin
  } catch {
    return null
  }
}

function directive(name: string, values: string[]): string {
  return `${name} ${values.join(' ')}`
}

export function buildContentSecurityPolicy(env: SecurityHeaderEnv = process.env): string {
  const isProduction = env.NODE_ENV === 'production'
  const r2Origin = originOf(env.R2_PUBLIC_URL)
  const authOrigin = originOf(env.NEON_AUTH_BASE_URL)

  const connectSrc = [
    "'self'",
    ...BOKUN_ORIGINS,
    ...TILE_ORIGINS,
    ...(r2Origin ? [r2Origin] : []),
    ...(authOrigin ? [authOrigin] : []),
  ]

  const directives = [
    directive('default-src', ["'self'"]),
    // Next.js injects inline bootstrap scripts and Bókun injects its widget at
    // runtime, so 'unsafe-inline' is required without a nonce pipeline.
    // 'unsafe-eval' is dev-only (React Refresh); production does not need it.
    directive('script-src', [
      "'self'",
      "'unsafe-inline'",
      ...(isProduction ? [] : ["'unsafe-eval'"]),
      ...BOKUN_ORIGINS,
    ]),
    // Tailwind/Leaflet/Bókun all set inline styles.
    directive('style-src', ["'self'", "'unsafe-inline'"]),
    // Editor uploads, map tiles and remote banners are all images; `blob:` is
    // used by the Quill editor preview.
    directive('img-src', ["'self'", 'data:', 'blob:', 'https:']),
    directive('font-src', ["'self'", 'data:']),
    directive('connect-src', connectSrc),
    // The booking calendar renders inside a Bókun iframe.
    directive('frame-src', ["'self'", ...BOKUN_ORIGINS]),
    directive('worker-src', ["'self'", 'blob:']),
    // The three that most directly blunt an XSS foothold.
    directive('object-src', ["'none'"]),
    directive('base-uri', ["'self'"]),
    directive('form-action', ["'self'"]),
    // Clickjacking protection (modern equivalent of X-Frame-Options).
    directive('frame-ancestors', ["'none'"]),
  ]

  if (isProduction) {
    directives.push('upgrade-insecure-requests')
  }

  return directives.join('; ')
}

export function buildSecurityHeaders(env: SecurityHeaderEnv = process.env): HeaderEntry[] {
  const isProduction = env.NODE_ENV === 'production'

  const headers: HeaderEntry[] = [
    { key: 'Content-Security-Policy', value: buildContentSecurityPolicy(env) },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
    },
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
  ]

  // Only meaningful over HTTPS, and pinning it from a local dev server would
  // break plain-http localhost for the whole domain.
  if (isProduction) {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    })
  }

  return headers
}
