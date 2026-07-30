import { resolveBokunCredentials } from '@/lib/site-config.defaults'

/**
 * These guard a handover hazard rather than a feature: the fallback must never
 * be a usable Bókun account, or a deploy with incomplete environment variables
 * would quietly route real bookings to whoever owned the hardcoded one.
 */
describe('resolveBokunCredentials', () => {
  it('returns the configured credentials when both are present', () => {
    expect(resolveBokunCredentials('chan-abc', '908070', 'production')).toEqual({
      channel: 'chan-abc',
      experienceId: '908070',
    })
  })

  it('trims surrounding whitespace from env values', () => {
    expect(resolveBokunCredentials('  chan-abc  ', ' 42 ', 'production')).toEqual({
      channel: 'chan-abc',
      experienceId: '42',
    })
  })

  it('throws in production when either half is missing', () => {
    for (const args of [
      [undefined, '908070'],
      ['chan-abc', undefined],
      [undefined, undefined],
      ['', '908070'],
      ['chan-abc', '   '],
    ] as const) {
      expect(() => resolveBokunCredentials(args[0], args[1], 'production')).toThrow(
        /NEXT_PUBLIC_BOKUN_CHANNEL/,
      )
    }
  })

  it('falls back to placeholders in development instead of failing the build', () => {
    const result = resolveBokunCredentials(undefined, undefined, 'development')

    expect(result.channel).toBe('missing-bokun-channel')
    expect(result.experienceId).toBe('0')
  })

  it('never falls back to a plausible real account', () => {
    const result = resolveBokunCredentials(undefined, undefined, 'development')

    // A real Bókun channel is a UUID and a real experience id is a long number.
    expect(result.channel).not.toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
    expect(Number(result.experienceId)).toBe(0)
  })

  it('keeps a partially configured environment usable in development', () => {
    expect(resolveBokunCredentials('chan-abc', undefined, 'development')).toEqual({
      channel: 'chan-abc',
      experienceId: '0',
    })
  })
})
