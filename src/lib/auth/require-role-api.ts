import { auth } from '@/lib/auth/server'
import { isAppRole, ROLES, type AppRole } from '@/lib/auth/roles'
import { NextResponse } from 'next/server'

type SessionUser = {
  id: string
  role?: string | null
}

export async function getApiSessionUser(): Promise<SessionUser | null> {
  const { data: session } = await auth.getSession()
  const user = session?.user

  if (!user?.id) return null

  return {
    id: user.id,
    role: user.role,
  }
}

export async function requireTeamRoleApi(roles: AppRole[] = [...ROLES]) {
  const user = await getApiSessionUser()

  if (!user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    } as const
  }

  if (!isAppRole(user.role) || !roles.includes(user.role)) {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    } as const
  }

  return { user: { ...user, role: user.role } } as const
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}
