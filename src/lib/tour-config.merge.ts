import { getDefaultTourSettingsInput } from '@/lib/tour-config.defaults'
import type { ResolvedTourConfig, TourSettingsInput } from '@/lib/tour-config.types'

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
  }
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

function mergeBannerPhotos(
  defaults: TourSettingsInput['bannerPhotos'],
  overrides?: Partial<TourSettingsInput['bannerPhotos']> | TourSettingsInput['bannerPhotos'],
): TourSettingsInput['bannerPhotos'] {
  if (!overrides || !Array.isArray(overrides) || overrides.length !== 5) {
    return defaults
  }

  return [
    mergeBannerPhoto(defaults[0], overrides[0]),
    mergeBannerPhoto(defaults[1], overrides[1]),
    mergeBannerPhoto(defaults[2], overrides[2]),
    mergeBannerPhoto(defaults[3], overrides[3]),
    mergeBannerPhoto(defaults[4], overrides[4]),
  ]
}

export function parseTourSettingsJson(data: unknown): TourSettingsInput {
  if (!isPlainObject(data)) {
    return getDefaultTourSettingsInput()
  }

  return mergeTourSettingsInput(data as Partial<TourSettingsInput>)
}

export function resolveTourConfig(input: TourSettingsInput): ResolvedTourConfig {
  const tour = input.tour
  const bannerPhotosInput =
    input.bannerPhotos?.length === 5
      ? input.bannerPhotos
      : getDefaultTourSettingsInput().bannerPhotos

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
    bannerPhotos: bannerPhotosInput.map((photo, index) => ({
      src: photo.url.trim(),
      alt: photo.alt_text.trim(),
      label: photo.label.trim(),
      featured: index === 0,
    })),
  }
}
