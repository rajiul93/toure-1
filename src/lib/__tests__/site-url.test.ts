import { resolveSiteUrl } from '@/lib/site-config'

describe('resolveSiteUrl', () => {
  it('uses the configured url and strips a trailing slash', () => {
    expect(resolveSiteUrl('https://daytourparis.com/', 'production')).toBe(
      'https://daytourparis.com',
    )
  })

  it('throws in production when the variable is missing', () => {
    // The original bug: this silently returned localhost, so every canonical
    // and sitemap entry pointed at localhost.
    expect(() => resolveSiteUrl(undefined, 'production')).toThrow(
      /NEXT_PUBLIC_SITE_URL is required in production/,
    )
  })

  it('throws in production when the variable is blank', () => {
    expect(() => resolveSiteUrl('   ', 'production')).toThrow(
      /required in production/,
    )
  })

  it('falls back to localhost outside production', () => {
    expect(resolveSiteUrl(undefined, 'development')).toBe('http://localhost:3000')
    expect(resolveSiteUrl(undefined, 'test')).toBe('http://localhost:3000')
  })

  it('rejects a non-absolute url', () => {
    expect(() => resolveSiteUrl('daytourparis.com', 'development')).toThrow(
      /must be an absolute URL/,
    )
  })

  it('rejects a non-http protocol', () => {
    expect(() => resolveSiteUrl('ftp://daytourparis.com', 'development')).toThrow(
      /must be http/,
    )
  })

  it('warns but does not throw for a localhost url in a production build', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    expect(resolveSiteUrl('http://localhost:3000', 'production')).toBe(
      'http://localhost:3000',
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('localhost'))
    warn.mockRestore()
  })

  it('does not warn for a real domain in production', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    resolveSiteUrl('https://daytourparis.com', 'production')
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
