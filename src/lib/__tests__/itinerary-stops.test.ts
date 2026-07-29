import { getDefaultTourSettingsInput } from '@/lib/tour-config.defaults'
import {
  mergeTourSettingsInput,
  normalizeItineraryStops,
  parseTourSettingsJson,
  resolveTourConfig,
} from '@/lib/tour-config.merge'
import { tourSettingsSchema } from '@/lib/validations/tour-settings.validation'
import type { ItineraryStop } from '@/lib/tour-config.types'

function stop(overrides: Partial<ItineraryStop> = {}): Partial<ItineraryStop> {
  return {
    id: 'stop-a',
    kind: 'stop',
    title: 'A stop',
    subtitle: '',
    timelineArea: '',
    duration: '',
    description: '',
    address: '',
    lat: 48.86,
    lng: 2.33,
    mapsUrl: '',
    ...overrides,
  }
}

describe('normalizeItineraryStops', () => {
  it('numbers only the stop rows, in order', () => {
    const stops = normalizeItineraryStops([
      stop({ id: 'meeting', kind: 'meeting' }),
      stop({ id: 's1' }),
      stop({ id: 's2' }),
      stop({ id: 'end', kind: 'end' }),
    ])

    expect(stops.map((s) => s.number)).toEqual([undefined, 1, 2, undefined])
  })

  it('renumbers after a stop is removed, so the admin never renumbers by hand', () => {
    const stops = normalizeItineraryStops([
      stop({ id: 'meeting', kind: 'meeting' }),
      // 'stop-1' deleted — what was #2 and #3 must become #1 and #2.
      stop({ id: 's2', number: 2 }),
      stop({ id: 's3', number: 3 }),
    ])

    expect(stops.map((s) => s.number)).toEqual([undefined, 1, 2])
  })

  it('de-duplicates ids so React keys and map markers stay unique', () => {
    const stops = normalizeItineraryStops([stop({ id: 'same' }), stop({ id: 'same' })])

    expect(stops[0].id).toBe('same')
    expect(stops[1].id).not.toBe('same')
    expect(new Set(stops.map((s) => s.id)).size).toBe(2)
  })

  it('falls back to a generated id when one is blank', () => {
    expect(normalizeItineraryStops([stop({ id: '   ' })])[0].id).toBe('stop-1')
  })

  it('coerces an unknown kind to a plain stop', () => {
    const stops = normalizeItineraryStops([
      { ...stop(), kind: 'wharrgarbl' } as unknown as Partial<ItineraryStop>,
    ])

    expect(stops[0].kind).toBe('stop')
    expect(stops[0].number).toBe(1)
  })

  it('replaces missing or non-finite coordinates with 0 rather than NaN', () => {
    const stops = normalizeItineraryStops([
      { id: 'x', kind: 'stop', title: 'x' } as Partial<ItineraryStop>,
      stop({ id: 'y', lat: Number.NaN, lng: Number.POSITIVE_INFINITY }),
    ])

    expect(stops[0].lat).toBe(0)
    expect(stops[0].lng).toBe(0)
    expect(stops[1].lat).toBe(0)
    expect(stops[1].lng).toBe(0)
  })

  it('trims whitespace out of text fields', () => {
    expect(normalizeItineraryStops([stop({ title: '  Padded  ' })])[0].title).toBe('Padded')
  })
})

describe('tour settings merge', () => {
  it('backfills the built-in stops for configs saved before the field existed', () => {
    const legacy = { ...getDefaultTourSettingsInput() } as Record<string, unknown>
    delete legacy.itineraryStops

    const merged = mergeTourSettingsInput(legacy as never)

    expect(merged.itineraryStops.length).toBeGreaterThan(0)
    expect(merged.itineraryStops).toEqual(getDefaultTourSettingsInput().itineraryStops)
  })

  it('backfills when the saved list is empty rather than rendering an empty map', () => {
    const merged = mergeTourSettingsInput({ itineraryStops: [] })
    expect(merged.itineraryStops.length).toBeGreaterThan(0)
  })

  it('keeps admin-saved stops instead of the defaults', () => {
    const merged = mergeTourSettingsInput({
      itineraryStops: [stop({ id: 'custom', title: 'My stop' }) as ItineraryStop],
    })

    expect(merged.itineraryStops).toHaveLength(1)
    expect(merged.itineraryStops[0].title).toBe('My stop')
  })

  it('survives a stored config that is not an object', () => {
    expect(parseTourSettingsJson('nonsense').itineraryStops.length).toBeGreaterThan(0)
  })
})

describe('resolveTourConfig', () => {
  it('exposes normalized stops to the public pages', () => {
    const config = resolveTourConfig(getDefaultTourSettingsInput())

    expect(config.itineraryStops.length).toBeGreaterThan(0)
    expect(config.itineraryStops[0].kind).toBe('meeting')
    expect(config.itineraryStops.at(-1)?.kind).toBe('end')
  })

  it('never hands the timeline an empty list', () => {
    const config = resolveTourConfig({
      ...getDefaultTourSettingsInput(),
      itineraryStops: [],
    })

    expect(config.itineraryStops.length).toBeGreaterThan(0)
  })
})

describe('tourSettingsSchema — itineraryStops', () => {
  const base = getDefaultTourSettingsInput()

  it('accepts the shipped defaults', () => {
    expect(tourSettingsSchema.safeParse(base).success).toBe(true)
  })

  it('requires at least one stop', () => {
    const result = tourSettingsSchema.safeParse({ ...base, itineraryStops: [] })
    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain('at least one itinerary stop')
  })

  it('rejects duplicate ids', () => {
    const result = tourSettingsSchema.safeParse({
      ...base,
      itineraryStops: [stop({ id: 'dup' }), stop({ id: 'dup' })],
    })

    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain('unique id')
  })

  it('rejects two meeting points or two end points', () => {
    for (const kind of ['meeting', 'end'] as const) {
      const result = tourSettingsSchema.safeParse({
        ...base,
        itineraryStops: [stop({ id: 'a', kind }), stop({ id: 'b', kind })],
      })

      expect(result.success).toBe(false)
      expect(JSON.stringify(result.error?.issues)).toContain(`Only one stop can be the ${kind} point`)
    }
  })

  it('rejects out-of-range coordinates', () => {
    expect(
      tourSettingsSchema.safeParse({ ...base, itineraryStops: [stop({ lat: 91 })] }).success,
    ).toBe(false)
    expect(
      tourSettingsSchema.safeParse({ ...base, itineraryStops: [stop({ lng: -181 })] }).success,
    ).toBe(false)
  })

  it('requires a title', () => {
    const result = tourSettingsSchema.safeParse({ ...base, itineraryStops: [stop({ title: '' })] })
    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain('Stop title is required')
  })
})
