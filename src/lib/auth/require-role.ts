import { auth } from '@/lib/auth/server'
import { getRoleHome, isAppRole, type AppRole } from '@/lib/auth/roles'
import { redirect } from 'next/navigation'

export async function getSessionUser() {
  const { data: session } = await auth.getSession()
  return session?.user ?? null
}

export async function requireAuth() {
  const user = await getSessionUser()
  if (!user) {
    redirect('/auth/sign-in')
  }
  return user
}

export async function requireRole(role: AppRole) {
  const user = await requireAuth()
  const userRole = user.role

  if (!isAppRole(userRole)) {
    redirect('/auth/sign-in')
  }

  if (userRole !== role) {
    redirect(getRoleHome(userRole))
  }

  return user
}
