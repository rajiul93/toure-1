import Footer from '@/components/footer'
import { BookingLayoutProvider } from '@/components/booking-layout-context'
import Navbar from '@/components/navbar'
import PublicPageShell from '@/components/public-page-shell'

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4">
        <BookingLayoutProvider>
          <PublicPageShell>{children}</PublicPageShell>
        </BookingLayoutProvider>
      </main>
      <Footer />
    </>
  );
}
