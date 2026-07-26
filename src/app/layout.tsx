import type { Metadata } from 'next'
import StructuredData from '@/components/structured-data'
import { BANNER_PHOTOS } from './(public)/home/photos'
import { getSiteUrl, SITE } from '@/lib/site-config'
import { LOUVRE_TOUR } from '@/lib/tour-schema'
import { Manrope, Pinyon_Script } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const pinyonScript = Pinyon_Script({
  variable: '--font-pinyon-script',
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: LOUVRE_TOUR.title,
    template: `%s | ${SITE.brand.full}`,
  },
  description: LOUVRE_TOUR.description,
  keywords: [...LOUVRE_TOUR.keywords],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${pinyonScript.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://widgets.bokun.io" />
        <link rel="dns-prefetch" href="https://widgets.bokun.io" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM site summary" />
        <link
          rel="preload"
          as="image"
          href={BANNER_PHOTOS[0].src}
          fetchPriority="high"
        />
        <StructuredData />
      </head>
      <body className={`${manrope.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  )
}
