import { formatRelativeTime } from '@/lib/dayjs'

describe('formatRelativeTime', () => {
  it('describes a recent time as "ago"', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    expect(formatRelativeTime(twoHoursAgo)).toMatch(/ago$/)
  })

  it('accepts an ISO string, which is what the service returns', () => {
    const iso = new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(iso)).toMatch(/day|hours/)
  })

  it('returns an empty string for an unparseable value rather than "Invalid Date"', () => {
    expect(formatRelativeTime('not-a-date')).toBe('')
  })
})
