import DashboardSidebar from '@/components/dashboard/dashboard-sidebar'
import { DASHBOARD_NAV } from '@/lib/dashboard-nav'
import type { AppRole } from '@/lib/auth/roles'
import type { ReactNode } from 'react'

export default function DashboardShell({
  role,
  userName,
  userEmail,
  title,
  description,
  children,
}: {
  role: AppRole
  userName: string
  userEmail: string
  title?: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-dvh bg-zinc-50">
      <DashboardSidebar
        role={role}
        userName={userName}
        userEmail={userEmail}
        items={DASHBOARD_NAV[role]}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {title || description ? (
          <header className="shrink-0 border-b border-zinc-200 bg-white px-6 py-5">
            {title ? <h1 className="text-xl font-bold text-heading">{title}</h1> : null}
            {description ? (
              <p className="mt-1 text-sm text-zinc-500">{description}</p>
            ) : null}
          </header>
        ) : null}

        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  )
}
