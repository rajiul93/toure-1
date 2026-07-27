import { getSiteUrl } from '@/lib/site-config'

describe('jest harness', () => {
  it('runs TypeScript and resolves the @/ alias', () => {
    expect(typeof getSiteUrl()).toBe('string')
  })
})
