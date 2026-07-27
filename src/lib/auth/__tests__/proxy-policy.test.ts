import { decideProxyAction, isProtectedTeamApi } from '@/lib/auth/proxy-policy'

const TEAM_APIS = [
  '/api/admin/blogs',
  '/api/admin/blogs/123',
  '/api/admin/blogs/123/publish',
  '/api/admin/site-config',
  '/api/admin/site-seo',
  '/api/admin/tour-config',
  '/api/images',
  '/api/images/42',
  '/api/images/usage',
  // A route that does not exist yet must still be covered by the prefix rule.
  '/api/admin/future-endpoint',
]

describe('isProtectedTeamApi', () => {
  it.each(TEAM_APIS)('protects %s', (path) => {
    expect(isProtectedTeamApi(path)).toBe(true)
  })

  it.each(['/', '/blog', '/api/blog', '/api/auth/callback', '/auth/sign-in'])(
    'leaves %s public',
    (path) => {
      expect(isProtectedTeamApi(path)).toBe(false)
    },
  )

  it('does not match a lookalike prefix', () => {
    expect(isProtectedTeamApi('/api/administrator')).toBe(false)
    expect(isProtectedTeamApi('/api/images-public')).toBe(false)
  })
})

describe('decideProxyAction', () => {
  // The vulnerability: a client-set `RSC: 1` header made the proxy skip auth
  // for every matched path, including the team APIs.
  it.each(TEAM_APIS)(
    'still enforces %s even when the request claims to be RSC',
    (path) => {
      expect(decideProxyAction(path, true)).toBe('enforce-team-api')
      expect(decideProxyAction(path, false)).toBe('enforce-team-api')
    },
  )

  it('sends normal dashboard page requests to the auth middleware', () => {
    expect(decideProxyAction('/admin', false)).toBe('auth-middleware')
    expect(decideProxyAction('/manager/blogs', false)).toBe('auth-middleware')
    expect(decideProxyAction('/marketer', false)).toBe('auth-middleware')
  })

  it('passes RSC page requests through to the layout guards', () => {
    // Redirecting an RSC request corrupts the payload, so these are handled by
    // `requireRole` in the dashboard layouts instead.
    expect(decideProxyAction('/admin', true)).toBe('passthrough-rsc')
  })

  it('never returns passthrough for an API path', () => {
    for (const path of TEAM_APIS) {
      expect(decideProxyAction(path, true)).not.toBe('passthrough-rsc')
    }
  })
})
