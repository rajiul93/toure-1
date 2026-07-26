import BookNowLink from '@/components/book-now-link'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
      <h1 className="mt-3 text-2xl font-bold text-heading sm:text-3xl">Page not found</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">
        The page you are looking for does not exist or may have moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-heading transition hover:bg-zinc-50"
        >
          Back to home
        </Link>
        <BookNowLink className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover">
          Check availability
        </BookNowLink>
      </div>
    </div>
  )
}
