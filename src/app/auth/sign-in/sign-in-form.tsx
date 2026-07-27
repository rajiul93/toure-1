'use client'

import { signInAction, type AuthActionState } from '@/app/auth/actions'
import { IconSpinner } from '@/components/icons'
import Link from 'next/link'
import { useActionState } from 'react'
import { FaEnvelope, FaLock } from 'react-icons/fa6'

const initialState: AuthActionState = {}

function Field({
  id,
  label,
  type,
  name,
  placeholder,
  autoComplete,
  icon: Icon,
}: {
  id: string
  label: string
  type: string
  name: string
  placeholder: string
  autoComplete: string
  icon: typeof FaEnvelope
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-heading">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
          aria-hidden="true"
        />
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required
          placeholder={placeholder}
          className="w-full rounded-2xl border border-zinc-200/90 bg-zinc-50/80 py-4 pl-11 pr-4 text-base text-heading outline-none transition placeholder:text-zinc-400 focus:border-primary/50 focus:bg-white focus:ring-2 focus:ring-primary/15 lg:py-3.5 lg:text-sm"
        />
      </div>
    </div>
  )
}

export default function SignInForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState)

  return (
    <form action={formAction} className="space-y-4 lg:space-y-5">
      <Field
        id="email"
        label="Work email"
        type="email"
        name="email"
        placeholder="name@company.com"
        autoComplete="email"
        icon={FaEnvelope}
      />

      <Field
        id="password"
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        icon={FaLock}
      />

      {state.error ? (
        <p
          role="alert"
          className="rounded-2xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="premium-shine mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-base font-extrabold tracking-wide text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary-hover disabled:opacity-70 lg:text-sm"
      >
        {pending ? <IconSpinner className="size-4" /> : null}
        {pending ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="border-t border-zinc-100 pt-4 text-center text-xs leading-relaxed text-zinc-500 lg:pt-5">
        Ask your admin for an account.{' '}
        <Link
          href="/"
          className="font-semibold text-primary underline-offset-2 hover:underline"
        >
          Back to site
        </Link>
      </p>
    </form>
  )
}
