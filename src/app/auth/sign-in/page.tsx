import SignInForm from '@/app/auth/sign-in/sign-in-form'
import { IconLock } from '@/components/icons'
import { auth } from '@/lib/auth/server'
import { getRoleHome, isAppRole } from '@/lib/auth/roles'
import { createPageMetadata } from '@/lib/metadata'
import { getSiteConfigFromDB } from '@/lib/services/site-settings.service'
import { getTourConfigFromDB } from '@/lib/services/tour-settings.service'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

async function getSignInPhoto() {
  const tourConfig = await getTourConfigFromDB()
  const featured = tourConfig.bannerPhotos[0]
  return {
    src: featured.src,
    alt: featured.alt,
  }
}

function DesktopHeroContent({
  brandName,
  brandScript,
}: {
  brandName: string
  brandScript: string
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-300/90">
        Team access
      </p>
      <h1 className="mt-3 text-[2rem] font-bold leading-tight tracking-tight text-white">
        <span className="block">{brandName}</span>
        <span className="font-script text-[2.75rem] font-normal text-secondary">
          {brandScript}
        </span>
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-200/95">
        Manage team accounts, roles, and internal tools. Public Louvre bookings stay
        on the main site.
      </p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3.5 py-2 text-[11px] font-medium text-zinc-100 backdrop-blur-md">
        <IconLock className="size-3.5 shrink-0 text-zinc-300" aria-hidden="true" />
        Secure login · Admin-created accounts only
      </div>
    </div>
  )
}

export const metadata = createPageMetadata({
  title: 'Sign in',
  description: 'Sign in to the Day Tour Paris team dashboard.',
  path: '/auth/sign-in',
})

export const dynamic = 'force-dynamic'

export default async function SignInPage() {
  const [site, signInPhoto] = await Promise.all([getSiteConfigFromDB(), getSignInPhoto()])
  const { data: session } = await auth.getSession()
  const role = session?.user?.role

  if (session?.user && isAppRole(role)) {
    redirect(getRoleHome(role))
  }

  return (
    <div className="relative min-h-screen bg-zinc-50 lg:bg-zinc-50">
      {/* Ambient glow — desktop only */}
      <div
        className="pointer-events-none absolute -left-32 top-0 hidden size-96 rounded-full bg-primary/10 blur-3xl lg:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 hidden size-80 rounded-full bg-secondary/15 blur-3xl lg:block"
        aria-hidden="true"
      />

      {/* Mobile header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            href="/"
            className="inline-flex min-w-0 items-baseline gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="truncate text-sm font-bold text-heading">{site.brand.name}</span>
            <span className="font-script text-xl leading-none text-secondary">
              {site.brand.script}
            </span>
          </Link>
          <Link
            href="/"
            className="shrink-0 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600"
          >
            Back
          </Link>
        </div>
      </header>

      {/* Desktop header */}
      <header className="relative z-20 hidden border-b border-zinc-200/70 bg-white/80 backdrop-blur-md lg:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="inline-flex items-baseline gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="text-base font-bold tracking-tight text-heading">
              {site.brand.name}
            </span>
            <span className="font-script text-2xl leading-none text-secondary">
              {site.brand.script}
            </span>
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            Back to site
          </Link>
        </div>
      </header>

      <main className="px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:flex lg:min-h-[calc(100vh-4rem)] lg:items-center lg:py-12">
        <div className="mx-auto w-full max-w-md lg:max-w-5xl">
          <div className="overflow-hidden rounded-3xl bg-white shadow-[0_16px_48px_-20px_rgba(30,42,68,0.28)] ring-1 ring-black/[0.04] lg:grid lg:grid-cols-[1.05fr_1fr] lg:shadow-2xl">
            {/* Mobile image strip — inside card, compact */}
            <div className="relative h-36 overflow-hidden lg:hidden">
              <Image
                src={signInPhoto.src}
                alt=""
                fill
                className="object-cover object-[center_35%]"
                sizes="100vw"
                priority
              />
              <div
                className="absolute inset-0 bg-linear-to-t from-heading/90 via-heading/40 to-heading/20"
                aria-hidden="true"
              />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                  Team access
                </p>
                <p className="mt-1 text-lg font-bold leading-tight text-white">
                  Sign in
                </p>
              </div>
            </div>

            {/* Desktop image panel */}
            <section className="relative hidden min-h-136 lg:block">
              <Image
                src={signInPhoto.src}
                alt={signInPhoto.alt}
                fill
                className="object-cover object-center"
                sizes="(min-width: 1024px) 520px, 0px"
                priority
              />
              <div
                className="absolute inset-0 bg-linear-to-br from-heading/90 via-heading/75 to-heading/85"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-linear-to-tr from-primary/30 via-transparent to-secondary/10"
                aria-hidden="true"
              />
              <div className="relative z-10 flex h-full flex-col justify-end p-10 xl:p-12">
                <DesktopHeroContent
                  brandName={site.brand.name}
                  brandScript={site.brand.script}
                />
              </div>
            </section>

            {/* Form panel */}
            <section className="px-5 py-6 sm:px-7 sm:py-8 lg:flex lg:flex-col lg:justify-center lg:px-10 lg:py-12 xl:px-12">
              <div className="mb-6 lg:mb-10">
                <p className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 lg:block">
                  Welcome back
                </p>
                <h2 className="text-xl font-bold tracking-tight text-heading lg:mt-2 lg:text-[1.65rem]">
                  <span className="lg:hidden">Welcome back</span>
                  <span className="hidden lg:inline">Sign in to your account</span>
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 lg:mt-2">
                  Admin, manager, and marketer access only.
                </p>
              </div>

              <SignInForm />
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
