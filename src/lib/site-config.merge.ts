import { getDefaultSiteSettingsInput } from '@/lib/site-config.defaults'
import { resolveSiteAboutIconKey } from '@/lib/about-value-icons'
import type { ResolvedSiteConfig, SiteAboutValue, SiteSettingsInput } from '@/lib/site-config.types'

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeAboutValues(values: SiteAboutValue[] | undefined): [
  SiteAboutValue,
  SiteAboutValue,
  SiteAboutValue,
] {
  const defaults = getDefaultSiteSettingsInput().about.values

  if (!values || values.length !== 3) {
    return defaults
  }

  return values.map((value, index) => ({
    title: value.title?.trim() || defaults[index].title,
    description: value.description?.trim() || defaults[index].description,
    icon: resolveSiteAboutIconKey(value.icon, defaults[index].icon),
  })) as [SiteAboutValue, SiteAboutValue, SiteAboutValue]
}

export function mergeSiteSettingsInput(
  overrides: Partial<SiteSettingsInput> | null | undefined,
): SiteSettingsInput {
  const defaults = getDefaultSiteSettingsInput()

  if (!overrides) return defaults

  return {
    ...defaults,
    ...overrides,
    brand: { ...defaults.brand, ...overrides.brand, logo: { ...defaults.brand.logo, ...overrides.brand?.logo } },
    contact: { ...defaults.contact, ...overrides.contact },
    bokun: { ...defaults.bokun, ...overrides.bokun },
    booking: {
      features: overrides.booking?.features?.length ? overrides.booking.features : defaults.booking.features,
      trustBadges: overrides.booking?.trustBadges?.length
        ? overrides.booking.trustBadges
        : defaults.booking.trustBadges,
    },
    about: {
      ...defaults.about,
      ...overrides.about,
      whatWeDo: overrides.about?.whatWeDo?.length === 2 ? overrides.about.whatWeDo : defaults.about.whatWeDo,
      values: mergeAboutValues(overrides.about?.values),
    },
    legal: overrides.legal?.length ? overrides.legal : defaults.legal,
    footerPages: overrides.footerPages?.length ? overrides.footerPages : defaults.footerPages,
  }
}

export function parseSiteSettingsJson(data: unknown): SiteSettingsInput {
  if (!isPlainObject(data)) {
    return getDefaultSiteSettingsInput()
  }

  return mergeSiteSettingsInput(data as Partial<SiteSettingsInput>)
}

export function resolveSiteConfig(input: SiteSettingsInput): ResolvedSiteConfig {
  const whatsappNumber = digitsOnly(input.contact.whatsappNumber)
  const channel = input.bokun.channel.trim()
  const experienceId = input.bokun.experienceId.trim()

  return {
    ...input,
    brand: {
      ...input.brand,
      full: `${input.brand.name.trim()} ${input.brand.script.trim()}`.trim(),
    },
    contact: {
      ...input.contact,
      whatsappNumber,
      whatsappUrl: whatsappNumber ? `https://wa.me/${whatsappNumber}` : '',
    },
    bokun: {
      channel,
      experienceId,
      loaderUrl: `https://widgets.bokun.io/assets/javascripts/apps/build/BokunWidgetsLoader.js?bookingChannelUUID=${channel}`,
      calendarUrl: `https://widgets.bokun.io/online-sales/${channel}/experience-calendar/${experienceId}`,
    },
  }
}
