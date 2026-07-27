import { loadPublicConfigWithFallback } from '@/lib/public-config'
import { getSiteConfigFromDB } from '@/lib/services/site-settings.service'
import { getTourConfigFromDB } from '@/lib/services/tour-settings.service'

jest.mock('@/lib/services/site-settings.service', () => ({
  getSiteConfigFromDB: jest.fn(),
}))
jest.mock('@/lib/services/tour-settings.service', () => ({
  getTourConfigFromDB: jest.fn(),
}))

const mockSite = getSiteConfigFromDB as jest.MockedFunction<typeof getSiteConfigFromDB>
const mockTour = getTourConfigFromDB as jest.MockedFunction<typeof getTourConfigFromDB>

const DB_DOWN = new Error("Can't reach database server")

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('loadPublicConfigWithFallback', () => {
  it('uses live config when the database is healthy', async () => {
    const site = { brand: { name: 'From DB' } } as never
    const tour = { louvreTour: { id: 'from-db' } } as never
    mockSite.mockResolvedValue(site)
    mockTour.mockResolvedValue(tour)

    const result = await loadPublicConfigWithFallback()

    expect(result.siteConfig).toBe(site)
    expect(result.tourConfig).toBe(tour)
    expect(result.degraded).toBe(false)
  })

  it('serves defaults instead of throwing when the database is down', async () => {
    // The regression: an unguarded await here took down every public page.
    mockSite.mockRejectedValue(DB_DOWN)
    mockTour.mockRejectedValue(DB_DOWN)

    const result = await loadPublicConfigWithFallback()

    expect(result.degraded).toBe(true)
    expect(result.siteConfig?.brand?.name).toBeTruthy()
    expect(result.tourConfig?.louvreTour).toBeTruthy()
  })

  it('degrades each read independently', async () => {
    const tour = { louvreTour: { id: 'from-db' } } as never
    mockSite.mockRejectedValue(DB_DOWN)
    mockTour.mockResolvedValue(tour)

    const result = await loadPublicConfigWithFallback()

    expect(result.tourConfig).toBe(tour)
    expect(result.siteConfig?.brand?.name).toBeTruthy()
    expect(result.degraded).toBe(true)
  })

  it('logs the failure so the outage is still visible in server logs', async () => {
    mockSite.mockRejectedValue(DB_DOWN)
    mockTour.mockRejectedValue(DB_DOWN)

    await loadPublicConfigWithFallback()

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('site config unavailable'),
      DB_DOWN,
    )
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('tour config unavailable'),
      DB_DOWN,
    )
  })

  it('never rejects, whatever the services do', async () => {
    mockSite.mockRejectedValue(DB_DOWN)
    mockTour.mockRejectedValue(new Error('timeout'))
    await expect(loadPublicConfigWithFallback()).resolves.toBeTruthy()
  })
})
