import { auth } from '@/lib/auth/server'
import { NextResponse, type NextRequest } from 'next/server'

const authMiddleware = auth.middleware({ loginUrl: '/auth/sign-in' })

function isServerActionRequest(request: NextRequest) {
  return (
    request.headers.has('Next-Action') ||
    request.headers.has('RSC') ||
    request.headers.get('Accept')?.includes('text/x-component') === true
  )
}

export default async function proxy(request: NextRequest) {
  // Server Actions carry their own auth checks — proxy must not redirect them
  if (isServerActionRequest(request)) {
    return NextResponse.next()
  }

  return authMiddleware(request)
}

export const config = {
  matcher: ['/admin/:path*', '/manager/:path*', '/marketer/:path*'],
}
