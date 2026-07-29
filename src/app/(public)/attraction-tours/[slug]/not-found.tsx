import Link from 'next/link'

export default function AttractionTourNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
      <h1 className="mt-3 text-2xl font-bold text-heading sm:text-3xl">Tour not found</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">
        This tour page does not exist. Browse our available Paris museum experiences instead.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/attraction-tours"
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
        >
          Browse attraction tours
        </Link>
        {/* The Louvre combine package lives on the home page, not here. */}
        <Link
          href="/"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-heading transition hover:bg-zinc-50"
        >
          Louvre timed entry
        </Link>
      </div>
    </div>
  )
}
