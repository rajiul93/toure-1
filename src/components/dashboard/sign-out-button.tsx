'use client'

import { signOutAction } from '@/app/auth/actions'
import { useTransition } from 'react'
import { FaRightFromBracket } from 'react-icons/fa6'

export default function SignOutButton() {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={pending ? 'Signing out' : 'Sign out'}
      title="Sign out"
      onClick={() => startTransition(() => signOutAction())}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-2 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-70 md:px-3 md:py-2"
    >
      <FaRightFromBracket className="size-4 shrink-0 md:hidden" aria-hidden="true" />
      <span className="hidden md:inline">{pending ? 'Signing out…' : 'Sign out'}</span>
    </button>
  )
}
