import Footer from '@/components/footer'
import { BookingLayoutProvider } from '@/components/booking-layout-context'
import Navbar from '@/components/navbar'
import PublicPageShell from '@/components/public-page-shell'
import { SiteConfigProvider } from '@/components/site-config/site-config-provider'
import { TourConfigProvider } from '@/components/tour-config/tour-config-provider'
import { resolveAttractionTourBookingTargets } from '@/lib/attraction-tour-public'
import { loadPublicConfigWithFallback } from '@/lib/public-config'

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [{ siteConfig, tourConfig }, bookingTargets] = await Promise.all([
    loadPublicConfigWithFallback(),
    resolveAttractionTourBookingTargets(),
  ])

  return (
    <SiteConfigProvider config={siteConfig}>
      <TourConfigProvider config={tourConfig}>
        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4">
          <BookingLayoutProvider>
            <PublicPageShell bookingTargets={bookingTargets}>{children}</PublicPageShell>
          </BookingLayoutProvider>
        </main>
        <Footer />
      </TourConfigProvider>
    </SiteConfigProvider>
  )
}
