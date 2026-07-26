import type { ReactNode } from 'react'

export default function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-linear-to-br from-heading via-[#243352] to-primary/90 px-6 py-10 text-white shadow-lg sm:px-10 sm:py-12">
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-secondary/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-primary/25 blur-3xl"
        aria-hidden
      />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">{eyebrow}</p>
        <h1 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-200 sm:text-base">
          {description}
        </p>
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </div>
  )
}
