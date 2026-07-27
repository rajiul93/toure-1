import type { SeoPageKey, SeoPageSettings, SiteSeoSettingsInput } from '@/lib/site-seo.types'

function pageDefaults(
  partial: Omit<SeoPageSettings, 'sitemapPriority' | 'sitemapChangeFrequency'> & {
    sitemapPriority: number
    sitemapChangeFrequency: SeoPageSettings['sitemapChangeFrequency']
  },
): SeoPageSettings {
  return partial
}

const sharedKeywords = [
  'Louvre tickets',
  'Louvre skip the line',
  'Louvre Pyramid timed entry',
  'Paris day tour',
  'Louvre audio guide',
  'Mona Lisa ticket',
  'Louvre Museum Paris',
  'Paris museum tickets',
  'timed entry Louvre',
]

export function getDefaultSiteSeoSettingsInput(): SiteSeoSettingsInput {
  const pages: Record<SeoPageKey, SeoPageSettings> = {
    home: pageDefaults({
      title: 'Louvre Pyramid Skip-the-Line Tickets & Audio Guide',
      description:
        'Book Louvre Pyramid timed-entry tickets with a multilingual audio guide. Instant confirmation, mobile ticket, and cancellation policy shown before payment.',
      keywords: [...sharedKeywords],
      ogImage: {
        url: '/images/banner/0.webp',
        alt_text: 'Louvre Pyramid entrance — skip-the-line timed entry tickets with audio guide',
      },
      sitemapPriority: 1,
      sitemapChangeFrequency: 'weekly',
    }),
    about: pageDefaults({
      title: 'About Us — Day Tour Paris',
      description:
        'Day Tour Paris helps travelers book timed-entry museum tickets with clear pricing, mobile tickets, and WhatsApp support when you need it.',
      keywords: ['Day Tour Paris', 'Paris museum booking', 'Louvre ticket partner', ...sharedKeywords.slice(0, 4)],
      ogImage: { url: '/images/banner/0.webp', alt_text: 'Day Tour Paris — Louvre museum booking team' },
      sitemapPriority: 0.7,
      sitemapChangeFrequency: 'monthly',
    }),
    reviews: pageDefaults({
      title: 'Traveler Reviews — Louvre Museum Tickets',
      description:
        'Read verified traveler reviews for Louvre Pyramid timed-entry tickets with audio guide. Rated 4.2 out of 5 from thousands of visitors.',
      keywords: ['Louvre reviews', 'Louvre ticket reviews', 'Louvre audio guide reviews', ...sharedKeywords.slice(0, 3)],
      ogImage: { url: '/images/banner/0.webp', alt_text: 'Traveler reviews for Louvre timed-entry tickets' },
      sitemapPriority: 0.8,
      sitemapChangeFrequency: 'weekly',
    }),
    blog: pageDefaults({
      title: 'Latest Blog Posts — Louvre Tips & Museum Guides',
      description:
        'Planning tips, Louvre routes, and ticket advice for a calm, memorable museum day in Paris.',
      keywords: ['Louvre travel tips', 'Paris museum guide', 'Louvre blog', ...sharedKeywords.slice(0, 4)],
      ogImage: { url: '/images/banner/0.webp', alt_text: 'Louvre museum travel tips and guides' },
      sitemapPriority: 0.8,
      sitemapChangeFrequency: 'weekly',
    }),
    attractionTours: pageDefaults({
      title: 'Attraction Tours — Paris Day Tours & Museum Tickets',
      description:
        'Browse timed-entry museum tours in Paris. Louvre Pyramid tickets with audio guide — instant confirmation and mobile tickets.',
      keywords: ['Paris attraction tours', 'Louvre day tour', ...sharedKeywords],
      ogImage: { url: '/images/banner/0.webp', alt_text: 'Paris attraction tours — Louvre timed entry' },
      sitemapPriority: 0.9,
      sitemapChangeFrequency: 'weekly',
    }),
  }

  return {
    global: {
      titleTemplate: '%s | Day Tour Paris',
      defaultKeywords: sharedKeywords,
      locale: 'en_US',
      language: 'en',
      robotsIndex: true,
      robotsFollow: true,
      googleSiteVerification: '',
      bingSiteVerification: '',
      yandexVerification: '',
    },
    openGraph: {
      siteName: 'Day Tour Paris',
      locale: 'en_US',
      defaultImage: {
        url: '/images/banner/0.webp',
        alt_text: 'Louvre Pyramid — skip-the-line timed entry tickets with audio guide',
        width: 1200,
        height: 630,
      },
    },
    twitter: {
      card: 'summary_large_image',
      site: '',
      creator: '',
    },
    organization: {
      name: 'Day Tour Paris',
      description:
        'Book Louvre Pyramid timed-entry tickets with multilingual audio guides. Instant confirmation, mobile tickets, and clear policies before you pay.',
      logo: {
        url: '',
        alt_text: 'Day Tour Paris logo',
      },
      sameAs: [],
      email: '',
      telephone: '',
    },
    crawlers: {
      allowAiBots: true,
      disallowPaths: ['/admin', '/manager', '/marketer', '/auth', '/api'],
    },
    pages,
  }
}
