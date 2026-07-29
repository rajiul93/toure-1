import { normalizeBannerPhotos, resolveTourConfig } from '@/lib/tour-config.merge'
import { getDefaultTourSettingsInput } from '@/lib/tour-config.defaults'

function photo(id: string, featured = false) {
  return {
    id,
    url: `/images/banner/${id}.webp`,
    alt_text: `${id} alt`,
    label: id,
    featured,
  }
}

function configWith(photos: ReturnType<typeof photo>[]) {
  return { ...getDefaultTourSettingsInput(), bannerPhotos: photos }
}

describe('normalizeBannerPhotos', () => {
  it('keeps the chosen feature image and leaves order untouched', () => {
    const result = normalizeBannerPhotos([photo('a'), photo('b', true), photo('c')])
    expect(result.map((p) => p.id)).toEqual(['a', 'b', 'c'])
    expect(result.filter((p) => p.featured).map((p) => p.id)).toEqual(['b'])
  })

  it('falls back to the first photo when legacy data has no feature flag', () => {
    const result = normalizeBannerPhotos([
      { url: '/a.webp', alt_text: 'a', label: 'a' },
      { url: '/b.webp', alt_text: 'b', label: 'b' },
    ])
    expect(result[0].featured).toBe(true)
    expect(result[1].featured).toBe(false)
  })

  it('backfills ids for legacy data so drag-and-drop keys stay stable', () => {
    const result = normalizeBannerPhotos([
      { url: '/a.webp', alt_text: 'a', label: 'a' },
      { url: '/b.webp', alt_text: 'b', label: 'b' },
    ])
    expect(result.map((p) => p.id)).toEqual(['banner-0', 'banner-1'])
  })

  it('collapses multiple feature flags down to the first', () => {
    const result = normalizeBannerPhotos([
      photo('a'),
      photo('b', true),
      photo('c', true),
    ])
    expect(result.filter((p) => p.featured).map((p) => p.id)).toEqual(['b'])
  })

  it('drops entries without a url instead of rendering broken images', () => {
    const result = normalizeBannerPhotos([photo('a', true), { alt_text: 'x', label: 'x' }])
    expect(result).toHaveLength(1)
  })

  it('accepts more than five photos', () => {
    const many = Array.from({ length: 9 }, (_, i) => photo(`p${i}`, i === 0))
    expect(normalizeBannerPhotos(many)).toHaveLength(9)
  })
})

describe('resolveTourConfig — hero ordering', () => {
  it('puts the feature image first, then the rest in saved order', () => {
    const resolved = resolveTourConfig(
      configWith([photo('a'), photo('b'), photo('c', true), photo('d'), photo('e')]),
    )
    expect(resolved.bannerPhotos.map((p) => p.label)).toEqual(['c', 'a', 'b', 'd', 'e'])
  })

  it('marks only the leading photo as featured for the collage', () => {
    const resolved = resolveTourConfig(
      configWith([photo('a'), photo('b', true), photo('c'), photo('d'), photo('e')]),
    )
    expect(resolved.bannerPhotos[0].featured).toBe(true)
    expect(resolved.bannerPhotos.slice(1).every((p) => !p.featured)).toBe(true)
  })

  it('reflects a reorder of the non-feature photos', () => {
    const before = resolveTourConfig(
      configWith([photo('a', true), photo('b'), photo('c'), photo('d'), photo('e')]),
    )
    const after = resolveTourConfig(
      configWith([photo('a', true), photo('d'), photo('c'), photo('b'), photo('e')]),
    )
    expect(before.bannerPhotos.map((p) => p.label)).toEqual(['a', 'b', 'c', 'd', 'e'])
    expect(after.bannerPhotos.map((p) => p.label)).toEqual(['a', 'd', 'c', 'b', 'e'])
  })

  it('falls back to defaults when no photos are configured', () => {
    const resolved = resolveTourConfig(configWith([]))
    expect(resolved.bannerPhotos.length).toBeGreaterThanOrEqual(5)
    expect(resolved.bannerPhotos[0].featured).toBe(true)
  })

  it('keeps every photo, not just the first five', () => {
    const many = Array.from({ length: 8 }, (_, i) => photo(`p${i}`, i === 3))
    const resolved = resolveTourConfig(configWith(many))
    expect(resolved.bannerPhotos).toHaveLength(8)
    expect(resolved.bannerPhotos[0].label).toBe('p3')
  })
})
