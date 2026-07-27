export type SeoImage = {
  url: string
  alt_text: string
}

export type SeoPageKey = 'home' | 'about' | 'reviews' | 'blog' | 'attractionTours'

export type SeoPageSettings = {
  title: string
  description: string
  keywords: string[]
  ogImage: SeoImage
  sitemapPriority: number
  sitemapChangeFrequency:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never'
}

export type SiteSeoSettingsInput = {
  global: {
    titleTemplate: string
    defaultKeywords: string[]
    locale: string
    language: string
    robotsIndex: boolean
    robotsFollow: boolean
    googleSiteVerification: string
    bingSiteVerification: string
    yandexVerification: string
  }
  openGraph: {
    siteName: string
    locale: string
    defaultImage: SeoImage & {
      width: number
      height: number
    }
  }
  twitter: {
    card: 'summary' | 'summary_large_image'
    site: string
    creator: string
  }
  organization: {
    name: string
    description: string
    logo: SeoImage
    sameAs: string[]
    email: string
    telephone: string
  }
  crawlers: {
    allowAiBots: boolean
    disallowPaths: string[]
  }
  pages: Record<SeoPageKey, SeoPageSettings>
}

export type ResolvedSiteSeoConfig = SiteSeoSettingsInput

export const SEO_PAGE_PATHS: Record<SeoPageKey, string> = {
  home: '/',
  about: '/about-us',
  reviews: '/reviews',
  blog: '/blog',
  attractionTours: '/attraction-tours',
}
