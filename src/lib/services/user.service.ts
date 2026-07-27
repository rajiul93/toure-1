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

async function assignRole(userId: string, role: AppRole) {
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
