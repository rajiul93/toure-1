import { auth } from '@/lib/auth/server'
import { isAppRole, ROLES } from '@/lib/auth/roles'
import { NextResponse, type NextRequest } from 'next/server'

const authMiddleware = auth.middleware({ loginUrl: '/auth/sign-in' })

function isServerActionRequest(request: NextRequest) {
  return (
    request.headers.has('Next-Action') ||
    request.headers.has('RSC') ||
    request.headers.get('Accept')?.includes('text/x-component') === true
  )
}

function isProtectedTeamApi(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  return pathname.startsWith('/api/images') || pathname.startsWith('/api/admin/')
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
  if (isServerActionRequest(request)) {
    return NextResponse.next()
  }

  if (isProtectedTeamApi(request)) {
    const rejection = await rejectUnauthenticatedTeamApi()
    if (rejection) return rejection
    return NextResponse.next()
  }

  return authMiddleware(request)
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/manager/:path*',
    '/marketer/:path*',
    '/api/images',
    '/api/images/:path*',
    '/api/admin/blogs',
    '/api/admin/blogs/:path*',
    '/api/admin/site-config',
    '/api/admin/site-config/:path*',
    '/api/admin/tour-config',
    '/api/admin/tour-config/:path*',
    '/api/admin/site-seo',
    '/api/admin/site-seo/:path*',
  ],
}
