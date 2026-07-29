import { getDefaultTourSettingsInput } from '@/lib/tour-config.defaults'
import type {
  ItineraryStop,
  ResolvedTourConfig,
  StopKind,
  TourSettingsInput,
} from '@/lib/tour-config.types'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function mergeTourSettingsInput(
  overrides: Partial<TourSettingsInput> | null | undefined,
): TourSettingsInput {
  const defaults = getDefaultTourSettingsInput()

  if (!overrides) return defaults

  return {
    tour: {
      ...defaults.tour,
      ...overrides.tour,
      meetingPointCoords: {
        ...defaults.tour.meetingPointCoords,
        ...overrides.tour?.meetingPointCoords,
      },
      ogImage: {
        ...defaults.tour.ogImage,
        ...overrides.tour?.ogImage,
      },
      keywords: overrides.tour?.keywords?.length ? overrides.tour.keywords : defaults.tour.keywords,
    },
    faqs: overrides.faqs?.length ? overrides.faqs : defaults.faqs,
    importantInfo: overrides.importantInfo?.length ? overrides.importantInfo : defaults.importantInfo,
    bannerPhotos: mergeBannerPhotos(defaults.bannerPhotos, overrides.bannerPhotos),
    // Configs saved before the itinerary became editable have no such key, so
    // they fall back to the built-in stops rather than rendering an empty map.
    itineraryStops: overrides.itineraryStops?.length
      ? normalizeItineraryStops(overrides.itineraryStops)
      : defaults.itineraryStops,
  }
}

/**
 * Guarantees the invariants the section relies on: unique ids, a usable
 * `kind`, and sequential numbering for `stop` rows so the admin never has to
 * renumber by hand after a reorder or delete.
 */
export function normalizeItineraryStops(
  stops: Array<Partial<ItineraryStop> | undefined>,
): ItineraryStop[] {
  const seen = new Set<string>()
  let stopNumber = 0

  return stops
    .filter((stop): stop is Partial<ItineraryStop> => Boolean(stop))
    .map((stop, index) => {
      const kind: StopKind =
        stop.kind === 'meeting' || stop.kind === 'end' || stop.kind === 'stop'
          ? stop.kind
          : 'stop'

      let id = stop.id?.trim() || `stop-${index + 1}`
      while (seen.has(id)) id = `${id}-${index + 1}`
      seen.add(id)

      const normalized: ItineraryStop = {
        id,
        kind,
        title: stop.title?.trim() ?? '',
        subtitle: stop.subtitle?.trim() ?? '',
        timelineArea: stop.timelineArea?.trim() ?? '',
        duration: stop.duration?.trim() ?? '',
        description: stop.description?.trim() ?? '',
        address: stop.address?.trim() ?? '',
        lat: Number.isFinite(stop.lat) ? Number(stop.lat) : 0,
        lng: Number.isFinite(stop.lng) ? Number(stop.lng) : 0,
        mapsUrl: stop.mapsUrl?.trim() ?? '',
      }

      if (kind === 'stop') {
        stopNumber += 1
        normalized.number = stopNumber
      }

      return normalized
    })
}

function mergeBannerPhoto(
  defaults: TourSettingsInput['bannerPhotos'][number],
  override?: Partial<TourSettingsInput['bannerPhotos'][number]>,
): TourSettingsInput['bannerPhotos'][number] {
  return {
    ...defaults,
    ...override,
  }
}

/**
 * Fills in the fields older saved configs predate (`id`, `featured`) and
 * guarantees exactly one feature image, so downstream code can rely on both
 * without re-checking.
 */
export function normalizeBannerPhotos(
  photos: Array<Partial<TourSettingsInput['bannerPhotos'][number]>>,
): TourSettingsInput['bannerPhotos'] {
  const withIds = photos
    .filter((photo) => typeof photo?.url === 'string')
    .map((photo, index) => ({
      id: photo.id?.trim() || `banner-${index}`,
      url: photo.url ?? '',
      alt_text: photo.alt_text ?? '',
      label: photo.label ?? '',
      featured: photo.featured === true,
    }))

  if (withIds.length === 0) return []

  // Keep the first flagged photo; if none is flagged (legacy data), the first
  // photo becomes the feature, matching the old "index 0 is featured" rule.
  const featuredIndex = Math.max(
    0,
    withIds.findIndex((photo) => photo.featured),
  )

  return withIds.map((photo, index) => ({
    ...photo,
    featured: index === featuredIndex,
  }))
}

function mergeBannerPhotos(
  defaults: TourSettingsInput['bannerPhotos'],
  // A plain array of partials — the old `Partial<Tuple>` signature no longer
  // applies now that the list is variable length.
  overrides?: Array<Partial<TourSettingsInput['bannerPhotos'][number]> | undefined>,
): TourSettingsInput['bannerPhotos'] {
  if (!Array.isArray(overrides) || overrides.length === 0) {
    return normalizeBannerPhotos(defaults)
  }

  // Overrides are the full list now (length is user-controlled), so only fill
  // per-photo gaps from the matching default where one exists.
  return normalizeBannerPhotos(
    overrides
      .filter((override) => Boolean(override))
      .map((override, index) =>
        defaults[index] ? mergeBannerPhoto(defaults[index], override) : override!,
      ),
  )
}

export function parseTourSettingsJson(data: unknown): TourSettingsInput {
  if (!isPlainObject(data)) {
    return getDefaultTourSettingsInput()
  }

  return mergeTourSettingsInput(data as Partial<TourSettingsInput>)
}

export function resolveTourConfig(input: TourSettingsInput): ResolvedTourConfig {
  const tour = input.tour
  const normalized = normalizeBannerPhotos(input.bannerPhotos ?? [])
  const bannerPhotosInput =
    normalized.length > 0
      ? normalized
      : normalizeBannerPhotos(getDefaultTourSettingsInput().bannerPhotos)

  // Feature image leads; the rest keep the dashboard's drag-and-drop order.
  const orderedPhotos = [
    ...bannerPhotosInput.filter((photo) => photo.featured),
    ...bannerPhotosInput.filter((photo) => !photo.featured),
  ]

  return {
    louvreTour: {
      name: tour.name.trim(),
      title: tour.title.trim(),
      description: tour.description.trim(),
      shortDescription: tour.shortDescription.trim(),
      price: tour.price,
      priceCurrency: tour.priceCurrency,
      priceLabel: tour.priceLabel.trim(),
      rating: tour.rating,
      reviewCount: tour.reviewCount,
      reviewCountLabel: tour.reviewCountLabel.trim(),
      duration: tour.duration.trim(),
      durationLabel: tour.durationLabel.trim(),
      destination: tour.destination.trim(),
      meetingPoint: tour.meetingPoint.trim(),
      meetingPointCoords: {
        lat: tour.meetingPointCoords.lat,
        lng: tour.meetingPointCoords.lng,
      },
      ogImage: tour.ogImage.url.trim(),
      slug: tour.slug.trim(),
      href: tour.href.trim(),
      keywords: tour.keywords.map((keyword) => keyword.trim()).filter(Boolean),
      brand: tour.brand.trim(),
    },
    faqs: input.faqs.map((faq) => ({
      id: faq.id.trim(),
      question: faq.question.trim(),
      answer: faq.answer.trim(),
    })),
    importantInfo: input.importantInfo.map((section) => ({
      id: section.id.trim(),
      title: section.title.trim(),
      items: section.items.map((item) => item.trim()).filter(Boolean),
    })),
    bannerPhotos: orderedPhotos.map((photo, index) => ({
      src: photo.url.trim(),
      alt: photo.alt_text.trim(),
      label: photo.label.trim(),
      featured: index === 0,
    })),
    itineraryStops: normalizeItineraryStops(
      input.itineraryStops?.length
        ? input.itineraryStops
        : getDefaultTourSettingsInput().itineraryStops,
    ),
  }
}
