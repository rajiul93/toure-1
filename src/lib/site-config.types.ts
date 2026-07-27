export type SiteLogo = {
  url: string
  alt_text: string
}

export type SiteTrustBadge = {
  label: string
  tone: 'primary' | 'sky'
}

export type SiteLinkItem = {
  href: string
  label: string
}

export type SiteAboutIconKey =
  | 'calendar'
  | 'book'
  | 'whatsapp'
  | 'check'
  | 'lock'
  | 'star'
  | 'info'
  | 'map'

export type SiteAboutValue = {
  title: string
  description: string
  icon: SiteAboutIconKey
}

export type SiteSettingsInput = {
  brand: {
    name: string
    script: string
    logo: SiteLogo
  }
  tagline: string
  footerDescription: string
  contact: {
    whatsappNumber: string
    whatsappNavLabel: string
    whatsappCtaLabel: string
  }
  bokun: {
    channel: string
    experienceId: string
  }
  booking: {
    features: string[]
    trustBadges: SiteTrustBadge[]
  }
  about: {
    metadataDescription: string
    heroDescription: string
    whatWeDo: [string, string]
    values: [SiteAboutValue, SiteAboutValue, SiteAboutValue]
    closing: string
  }
  legal: SiteLinkItem[]
  footerPages: SiteLinkItem[]
}

export type ResolvedSiteConfig = SiteSettingsInput & {
  brand: SiteSettingsInput['brand'] & {
    full: string
  }
  contact: SiteSettingsInput['contact'] & {
    whatsappUrl: string
  }
  bokun: SiteSettingsInput['bokun'] & {
    loaderUrl: string
    calendarUrl: string
  }
}
