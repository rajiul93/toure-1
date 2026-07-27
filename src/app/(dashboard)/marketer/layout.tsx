import DashboardShell from '@/components/dashboard/dashboard-shell'
import { requireRole } from '@/lib/auth/require-role'

export const dynamic = 'force-dynamic'

export default async function MarketerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole('marketer')

  return (
    <DashboardShell
      role="marketer"
      userName={user.name}
      userEmail={user.email}
    >
      {children}
    </DashboardShell>
  )
}
