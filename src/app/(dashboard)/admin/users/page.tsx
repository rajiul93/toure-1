import AdminUsersClient from '@/app/(dashboard)/admin/users/admin-users-client'
import { listUsersFromDB } from '@/lib/services/user.service'
import { createPrivatePageMetadata } from '@/lib/metadata'

// Page metadata overrides the layout's, so this must be the private variant —
// `createPageMetadata` inherits `robots.index: true` from the site SEO defaults
// and would advertise the user list as indexable.
export const metadata = createPrivatePageMetadata({
  title: 'Users',
  description: 'Manage Day Tour Paris team accounts.',
  path: '/admin/users',
})

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  let users: Array<{ id: string; name: string; email: string; role?: string | null }> = []

  try {
    const data = await listUsersFromDB()
    users =
      data?.users?.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })) ?? []
  } catch {
    users = []
  }

  return <AdminUsersClient users={users} />
}
