export const ROLES = ['admin', 'manager', 'marketer'] as const

export type AppRole = (typeof ROLES)[number]

export const DEFAULT_ROLE: AppRole = 'marketer'

export const ROLE_HOME: Record<AppRole, string> = {
  admin: '/admin',
  manager: '/manager',
  marketer: '/marketer',
}

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  marketer: 'Marketer',
}

export function isAppRole(value: string | null | undefined): value is AppRole {
  return ROLES.includes(value as AppRole)
}

export function getRoleHome(role: string | null | undefined): string {
  if (isAppRole(role)) return ROLE_HOME[role]
  return '/auth/sign-in'
}
