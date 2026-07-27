'use server'

import { auth } from '@/lib/auth/server'
import { getRoleHome, isAppRole } from '@/lib/auth/roles'
import { createUserIntoDB, updateUserRoleInDB } from '@/lib/services/user.service'
import { createUserSchema, updateUserRoleSchema } from '@/lib/validations/user.validation'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export type AuthActionState = {
  error?: string
  success?: string
}

function getActionErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { error } = await auth.signIn.email(parsed.data)

  if (error) {
    return { error: error.message }
  }

  const { data: session } = await auth.getSession()
  const role = session?.user?.role
  redirect(getRoleHome(isAppRole(role) ? role : null))
}

export async function signOutAction() {
  await auth.signOut()
  redirect('/auth/sign-in')
}

export async function createUserAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { data: session } = await auth.getSession()

  if (session?.user?.role !== 'admin') {
    return { error: 'Only admins can create users' }
  }

  const parsed = createUserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  try {
    await createUserIntoDB(parsed.data)
    revalidatePath('/admin/users')
    return { success: `User ${parsed.data.email} created successfully` }
  } catch (err) {
    return { error: getActionErrorMessage(err, 'Could not create user') }
  }
}

export async function updateUserRoleAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { data: session } = await auth.getSession()

  if (session?.user?.role !== 'admin') {
    return { error: 'Only admins can change roles' }
  }

  const parsed = updateUserRoleSchema.safeParse({
    userId: formData.get('userId'),
    role: formData.get('role'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  try {
    await updateUserRoleInDB(parsed.data)
    revalidatePath('/admin/users')
    return { success: 'Role updated' }
  } catch (err) {
    return { error: getActionErrorMessage(err, 'Could not update role') }
  }
}
