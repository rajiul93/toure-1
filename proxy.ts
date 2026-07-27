import { auth } from '@/lib/auth/server'
import { isAppRole, ROLES } from '@/lib/auth/roles'
import { decideProxyAction } from '@/lib/auth/proxy-policy'
import { NextResponse, type NextRequest } from 'next/server'

const authMiddleware = auth.middleware({ loginUrl: '/auth/sign-in' })

function isServerActionRequest(request: NextRequest) {
  return (
    request.headers.has('Next-Action') ||
    request.headers.has('RSC') ||
    request.headers.get('Accept')?.includes('text/x-component') === true
  )
}

async function rejectUnauthenticatedTeamApi() {
  const { data: session } = await auth.getSession()
  const user = session?.user

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isAppRole(user.role) || !ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}

export default async function proxy(request: NextRequest) {
  const decision = decideProxyAction(
    request.nextUrl.pathname,
    isServerActionRequest(request),
  )

  if (decision === 'enforce-team-api') {
    const rejection = await rejectUnauthenticatedTeamApi()
    if (rejection) return rejection
    return NextResponse.next()
  }

  if (decision === 'passthrough-rsc') {
    return NextResponse.next()
  }

  return authMiddleware(request)
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/manager/:path*',
    '/marketer/:path*',
    // Prefix matchers rather than one entry per route, so a newly added
    // /api/admin/* endpoint is covered by the proxy automatically.
    '/api/images/:path*',
    '/api/images',
    '/api/admin/:path*',
    '/api/admin',
  ],
}
