import type { AppRole } from '@/lib/auth/roles'

export type DashboardNavItem = {
  href: string
  label: string
  icon: 'home' | 'users' | 'calendar' | 'chart' | 'blog' | 'settings' | 'tour' | 'seo'
}

export const DASHBOARD_NAV: Record<AppRole, DashboardNavItem[]> = {
  admin: [
    { href: '/admin', label: 'Dashboard', icon: 'home' },
    { href: '/admin/attraction-tours', label: 'Attraction tours', icon: 'tour' },
    { href: '/admin/blogs', label: 'Blogs', icon: 'blog' },
    { href: '/admin/site-config', label: 'Site config', icon: 'settings' },
    { href: '/admin/tour-config', label: 'Tour config', icon: 'tour' },
    { href: '/admin/site-seo', label: 'Site SEO', icon: 'seo' },
    { href: '/admin/users', label: 'Users', icon: 'users' },
  ],
  manager: [
    { href: '/manager', label: 'Dashboard', icon: 'home' },
    { href: '/manager/site-config', label: 'Site config', icon: 'settings' },
    { href: '/manager/tour-config', label: 'Tour config', icon: 'tour' },
    { href: '/manager/site-seo', label: 'Site SEO', icon: 'seo' },
    { href: '/manager/calendar', label: 'Calendar', icon: 'calendar' },
  ],
  marketer: [
    { href: '/marketer', label: 'Dashboard', icon: 'home' },
    { href: '/marketer/campaigns', label: 'Campaigns', icon: 'chart' },
  ],
}
