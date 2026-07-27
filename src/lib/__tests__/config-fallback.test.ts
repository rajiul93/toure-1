import { getDefaultSiteConfig } from '@/lib/site-config'
import { getDefaultTourConfig } from '@/lib/tour-config'

/**
 * The public layout falls back to these when the database is unreachable, so
 * they must be usable on their own — otherwise the "fallback" would itself
 * throw and take the site down anyway.
 */
describe('default config fallbacks', () => {
  it('site defaults resolve without touching the database', () => {
    const config = getDefaultSiteConfig()
    expect(config).toBeTruthy()
    expect(typeof config.brand.name).toBe('string')
    expect(config.brand.name.length).toBeGreaterThan(0)
    expect(typeof config.contact.whatsappUrl).toBe('string')
  })

  it('tour defaults resolve without touching the database', () => {
    const config = getDefaultTourConfig()
    expect(config).toBeTruthy()
    expect(config.louvreTour).toBeTruthy()
  })

  it('are pure — repeated calls do not throw or diverge in shape', () => {
    expect(Object.keys(getDefaultSiteConfig())).toEqual(
      Object.keys(getDefaultSiteConfig()),
    )
    expect(Object.keys(getDefaultTourConfig())).toEqual(
      Object.keys(getDefaultTourConfig()),
    )
  })
})
