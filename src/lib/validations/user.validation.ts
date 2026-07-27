import { ROLES } from '@/lib/auth/roles'
import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(ROLES),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(ROLES),
})

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
