import AdminProviders from '@/components/admin/admin-providers'
import DashboardShell from '@/components/dashboard/dashboard-shell'
import { requireRole } from '@/lib/auth/require-role'
import { createPrivatePageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createPrivatePageMetadata({
  title: 'Admin',
  description: 'Day Tour Paris admin dashboard.',
  path: '/admin',
})

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole('admin')

  return (
    <DashboardShell
      role="admin"
      userName={user.name}
      userEmail={user.email}
    >
      <AdminProviders>{children}</AdminProviders>
    </DashboardShell>
  )
}
