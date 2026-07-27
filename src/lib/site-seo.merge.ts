import { getDefaultSiteSeoSettingsInput } from '@/lib/site-seo.defaults'
import type { SeoPageKey, SiteSeoSettingsInput } from '@/lib/site-seo.types'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const PAGE_KEYS: SeoPageKey[] = ['home', 'about', 'reviews', 'blog', 'attractionTours']

function mergePage(
  defaults: SiteSeoSettingsInput['pages'][SeoPageKey],
  override?: Partial<SiteSeoSettingsInput['pages'][SeoPageKey]>,
) {
  return {
    ...defaults,
    ...override,
    ogImage: {
      ...defaults.ogImage,
      ...override?.ogImage,
    },
    keywords: override?.keywords?.length ? override.keywords : defaults.keywords,
  }
}

export function mergeSiteSeoSettingsInput(
  overrides: Partial<SiteSeoSettingsInput> | null | undefined,
): SiteSeoSettingsInput {
  const defaults = getDefaultSiteSeoSettingsInput()

  if (!overrides) return defaults

  const pages = PAGE_KEYS.reduce(
    (acc, key) => {
      acc[key] = mergePage(defaults.pages[key], overrides.pages?.[key])
      return acc
    },
    {} as SiteSeoSettingsInput['pages'],
  )

  return {
    global: { ...defaults.global, ...overrides.global },
    openGraph: {
      ...defaults.openGraph,
      ...overrides.openGraph,
      defaultImage: {
        ...defaults.openGraph.defaultImage,
        ...overrides.openGraph?.defaultImage,
      },
    },
    twitter: { ...defaults.twitter, ...overrides.twitter },
    organization: {
      ...defaults.organization,
      ...overrides.organization,
      logo: {
        ...defaults.organization.logo,
        ...overrides.organization?.logo,
      },
      sameAs: (overrides.organization?.sameAs ?? defaults.organization.sameAs).filter(Boolean),
    },
    crawlers: {
      ...defaults.crawlers,
      ...overrides.crawlers,
      disallowPaths: overrides.crawlers?.disallowPaths?.length
        ? overrides.crawlers.disallowPaths
        : defaults.crawlers.disallowPaths,
    },
    pages,
  }
}

export function parseSiteSeoSettingsJson(data: unknown): SiteSeoSettingsInput {
  if (!isPlainObject(data)) {
    return getDefaultSiteSeoSettingsInput()
  }

  return mergeSiteSeoSettingsInput(data as Partial<SiteSeoSettingsInput>)
}

export function resolveSiteSeoConfig(input: SiteSeoSettingsInput) {
  return input
}
