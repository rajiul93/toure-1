import { auth } from '@/lib/auth/server'
import { DEFAULT_ROLE, type AppRole } from '@/lib/auth/roles'
import type { CreateUserInput, UpdateUserRoleInput } from '@/lib/validations/user.validation'

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.length > 0) return message
  }
  return 'Request failed'
}

/**
 * Prevent accidentally locking the team out by demoting the only remaining
 * admin. If you're changing someone to a non-admin role AND they're currently
 * the only admin, reject it. This is fail-safe: if the count is wrong (e.g. a
 * user exists but isn't in Neon yet) listing will find fewer admins than
 * really exist, but that's safer than locking someone out.
 */
async function assignRole(userId: string, role: AppRole) {
  // Only guard against demotion (setting to a non-admin role).
  if (role !== 'admin') {
    const { data: users, error: listError } = await auth.admin.listUsers({
      query: { limit: 100 },
    })

    if (!listError && users?.users) {
      const adminCount = users.users.filter((u) => u.role === 'admin').length
      // If there's only 1 admin and we're about to demote them, refuse.
      if (adminCount === 1) {
        throw new Error(
          'Cannot demote the last admin. Ensure another user has admin access before proceeding.',
        )
      }
    }
  }

  const { data, error } = await auth.admin.setRole({
    userId,
    role: role as 'admin',
  })

  if (error) {
    throw new Error(getErrorMessage(error))
  }

  return data
}

export async function listUsersFromDB(limit = 100, offset = 0) {
  const { data, error } = await auth.admin.listUsers({
    query: { limit, offset },
  })

  if (error) {
    throw new Error(getErrorMessage(error))
  }

  return data
}

export async function createUserIntoDB(payload: CreateUserInput) {
  const role = payload.role ?? DEFAULT_ROLE

  const { data, error } = await auth.admin.createUser({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: role === 'admin' ? 'admin' : 'user',
  })

  if (error) {
    throw new Error(getErrorMessage(error))
  }

  const userId = data?.user?.id

  if (userId && role !== 'admin') {
    await assignRole(userId, role)
  }

  return data
}

export async function updateUserRoleInDB(payload: UpdateUserRoleInput) {
  return assignRole(payload.userId, payload.role)
}
