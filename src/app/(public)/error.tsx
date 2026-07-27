'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[public] route error', error)
  }, [error])

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">
        We couldn&apos;t load this page. This is usually temporary — please try
        again, or head back to the homepage.
      </p>

      {error.digest ? (
        <p className="mt-3 text-xs text-zinc-400">Reference: {error.digest}</p>
      ) : null}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-heading transition hover:bg-zinc-50"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  )
}
