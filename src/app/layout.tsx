import type { Metadata } from 'next'
import StructuredData from '@/components/structured-data'
import { createRootSiteMetadata } from '@/lib/metadata'
import { getSiteSeoFromDB } from '@/lib/services/site-seo.service'
import { getTourConfigFromDB } from '@/lib/services/tour-settings.service'
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

export async function generateMetadata(): Promise<Metadata> {
  return createRootSiteMetadata()
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [seo, tourConfig] = await Promise.all([getSiteSeoFromDB(), getTourConfigFromDB()])
  const featuredBanner = tourConfig.bannerPhotos[0]

  return (
    <html
      lang={seo.global.language}
      className={`${manrope.variable} ${pinyonScript.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://widgets.bokun.io" />
        <link rel="dns-prefetch" href="https://widgets.bokun.io" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM site summary" />
        <link
          rel="preload"
          as="image"
          href={featuredBanner.src}
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
