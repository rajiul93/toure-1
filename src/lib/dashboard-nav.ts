import type { AppRole } from '@/lib/auth/roles'

export type DashboardNavItem = {
  href: string
  label: string
  icon: 'home' | 'users' | 'calendar' | 'chart'
}

export const DASHBOARD_NAV: Record<AppRole, DashboardNavItem[]> = {
  admin: [
    { href: '/admin', label: 'Dashboard', icon: 'home' },
    { href: '/admin/users', label: 'Users', icon: 'users' },
  ],
  manager: [
    { href: '/manager', label: 'Dashboard', icon: 'home' },
    { href: '/manager/calendar', label: 'Calendar', icon: 'calendar' },
  ],
  marketer: [
    { href: '/marketer', label: 'Dashboard', icon: 'home' },
    { href: '/marketer/campaigns', label: 'Campaigns', icon: 'chart' },
  ],
}
