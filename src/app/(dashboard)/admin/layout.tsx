import DashboardShell from '@/components/dashboard/dashboard-shell'
import { requireRole } from '@/lib/auth/require-role'

export const dynamic = 'force-dynamic'

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
      {children}
    </DashboardShell>
  )
}
