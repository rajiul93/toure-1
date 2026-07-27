'use client'

import SignOutButton from '@/components/dashboard/sign-out-button'
import type { DashboardNavItem } from '@/lib/dashboard-nav'
import { ROLE_LABELS, type AppRole } from '@/lib/auth/roles'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FaCalendarDays,
  FaChartLine,
  FaHouse,
  FaUsers,
} from 'react-icons/fa6'

function NavIcon({ icon }: { icon: DashboardNavItem['icon'] }) {
  switch (icon) {
    case 'home':
      return <FaHouse className="size-5 shrink-0 md:size-4" aria-hidden="true" />
    case 'users':
      return <FaUsers className="size-5 shrink-0 md:size-4" aria-hidden="true" />
    case 'calendar':
      return <FaCalendarDays className="size-5 shrink-0 md:size-4" aria-hidden="true" />
    case 'chart':
      return <FaChartLine className="size-5 shrink-0 md:size-4" aria-hidden="true" />
  }
}

export default function DashboardSidebar({
  role,
  userName,
  userEmail,
  items,
}: {
  role: AppRole
  userName: string
  userEmail: string
  items: DashboardNavItem[]
}) {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-16 shrink-0 flex-col overflow-hidden border-r border-zinc-200 bg-white md:w-64">
      <div className="shrink-0 border-b border-zinc-200 px-2 py-4 md:px-5 md:py-5">
        <Link
          href="/"
          className="flex items-center justify-center md:justify-start"
          aria-label="Day Tour Paris home"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-xs font-bold text-primary-dark md:hidden">
            DT
          </span>
          <span className="hidden md:inline-flex md:items-baseline md:gap-1.5">
            <span className="text-sm font-bold text-heading">Day Tour</span>
            <span className="font-script text-lg leading-none text-secondary">Paris</span>
          </span>
        </Link>
        <p className="mt-2 hidden text-xs font-semibold uppercase tracking-widest text-zinc-400 md:block">
          {ROLE_LABELS[role]} panel
        </p>
      </div>

      <nav
        aria-label="Dashboard"
        className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-2 py-4 md:px-3"
      >
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== `/${role}` && pathname.startsWith(`${item.href}/`))

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              title={item.label}
              className={
                active
                  ? 'flex items-center justify-center gap-3 rounded-xl bg-primary-soft px-2 py-3 text-sm font-semibold text-primary-dark md:justify-start md:px-3 md:py-2.5'
                  : 'flex items-center justify-center gap-3 rounded-xl px-2 py-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-heading md:justify-start md:px-3 md:py-2.5'
              }
            >
              <NavIcon icon={item.icon} />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="shrink-0 border-t border-zinc-200 px-2 py-3 md:px-4 md:py-4">
        <div className="hidden md:block">
          <p className="truncate text-sm font-semibold text-heading">{userName}</p>
          <p className="truncate text-xs text-zinc-500">{userEmail}</p>
        </div>
        <div className="md:mt-3">
          <SignOutButton />
        </div>
      </div>
    </aside>
  )
}
