/**
 * Routing policy for the edge proxy, kept pure so the decision table can be
 * unit-tested without a running Next.js server or a real session.
 */

export type ProxyDecision =
  /** Verify the session here and reject with 401/403 before the route runs. */
  | 'enforce-team-api'
  /** Let it through; the dashboard layout's `requireRole` performs the check. */
  | 'passthrough-rsc'
  /** Hand off to the Neon Auth middleware (redirects to the login page). */
  | 'auth-middleware'

/** Team-only APIs. Must stay in sync with the matcher in `proxy.ts`. */
export function isProtectedTeamApi(pathname: string): boolean {
  return pathname === '/api/images' ||
    pathname.startsWith('/api/images/') ||
    pathname === '/api/admin' ||
    pathname.startsWith('/api/admin/')
}

/**
 * An `RSC`/`Next-Action` header can be set by anyone, so it must never be
 * treated as proof of anything. It only decides *how* an unauthenticated
 * caller is turned away: redirecting an RSC request corrupts the payload, so
 * those are passed to the layout guards instead — but API routes are always
 * enforced here regardless of the header.
 */
export function decideProxyAction(
  pathname: string,
  isRscRequest: boolean,
): ProxyDecision {
  // Checked first, and deliberately not skippable via a client-set header.
  if (isProtectedTeamApi(pathname)) return 'enforce-team-api'
  if (isRscRequest) return 'passthrough-rsc'
  return 'auth-middleware'
}
