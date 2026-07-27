import AdminProviders from '@/components/admin/admin-providers'
import DashboardShell from '@/components/dashboard/dashboard-shell'
import { requireRole } from '@/lib/auth/require-role'
import { createPrivatePageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createPrivatePageMetadata({
  title: 'Manager',
  description: 'Day Tour Paris manager dashboard.',
  path: '/manager',
})

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole('manager')

  return (
    <DashboardShell
      role="manager"
      userName={user.name}
      userEmail={user.email}
    >
      <AdminProviders>{children}</AdminProviders>
    </DashboardShell>
  )
}
