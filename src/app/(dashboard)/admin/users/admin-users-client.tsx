'use client'

import { createUserAction, updateUserRoleAction, type AuthActionState } from '@/app/auth/actions'
import { ROLES, ROLE_LABELS } from '@/lib/auth/roles'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'

const initialState: AuthActionState = {}

function CreateUserForm() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(createUserAction, initialState)

  useEffect(() => {
    if (state.success) {
      router.refresh()
    }
  }, [state.success, router])

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-heading">Create user</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Public sign-up is disabled. Only admins can add accounts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-heading">
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-heading">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-heading">
            Temporary password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-heading">
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue="marketer"
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-70"
      >
        {pending ? 'Creating…' : 'Create user'}
      </button>
    </form>
  )
}

type ListedUser = {
  id: string
  name: string
  email: string
  role?: string | null
}

function RoleSelectForm({ user }: { user: ListedUser }) {
  const [state, formAction, pending] = useActionState(updateUserRoleAction, initialState)

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={user.id} />
      <select
        name="role"
        defaultValue={user.role ?? 'marketer'}
        className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
      >
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-70"
      >
        Save
      </button>
      {state.error ? <span className="text-xs text-rose-600">{state.error}</span> : null}
    </form>
  )
}

export default function AdminUsersClient({ users }: { users: ListedUser[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading">Users</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Create accounts and assign admin, manager, or marketer roles.
        </p>
      </div>

      <CreateUserForm />

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="font-semibold text-heading">All users</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-widest text-zinc-400">
              <tr>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-zinc-500">
                    No users yet. Create the first account above.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-zinc-100">
                    <td className="px-6 py-4 font-medium text-heading">{user.name}</td>
                    <td className="px-6 py-4 text-zinc-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <RoleSelectForm user={user} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
