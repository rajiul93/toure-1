import DashboardShell from '@/components/dashboard/dashboard-shell'
import { requireRole } from '@/lib/auth/require-role'
import { createPrivatePageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createPrivatePageMetadata({
  title: 'Marketer',
  description: 'Day Tour Paris marketer dashboard.',
  path: '/marketer',
})

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
