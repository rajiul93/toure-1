export type TourBannerPhotoInput = {
  /** Stable key so drag-and-drop reordering survives re-renders and saves. */
  id: string
  url: string
  alt_text: string
  label: string
  /**
   * Exactly one photo is the feature image. It always leads the hero collage;
   * the rest follow in array order, which is what the dashboard reorders.
   */
  featured: boolean
}

export type BannerPhoto = {
  src: string
  alt: string
  label: string
  featured: boolean
}

export type TourOgImage = {
  url: string
  alt_text: string
}

export type TourFaqItem = {
  id: string
  question: string
  answer: string
}

export type TourImportantInfoSection = {
  id: string
  title: string
  items: string[]
}

export type StopKind = 'meeting' | 'stop' | 'end'

/**
 * One row of the "Meeting Point & Itinerary" section. `kind` drives the marker:
 * `meeting` starts the route, `stop` is numbered, `end` closes it.
 */
export type ItineraryStop = {
  id: string
  kind: StopKind
  number?: number
  title: string
  subtitle: string
  timelineArea: string
  duration: string
  description: string
  address: string
  lat: number
  lng: number
  mapsUrl: string
}

export type TourSettingsInput = {
  tour: {
    name: string
    title: string
    description: string
    shortDescription: string
    price: number
    priceCurrency: 'EUR'
    priceLabel: string
    rating: number
    reviewCount: number
    reviewCountLabel: string
    duration: string
    durationLabel: string
    destination: string
    meetingPoint: string
    meetingPointCoords: {
      lat: number
      lng: number
    }
    ogImage: TourOgImage
    slug: string
    href: string
    keywords: string[]
    brand: string
  }
  faqs: TourFaqItem[]
  importantInfo: TourImportantInfoSection[]
  /**
   * Variable length (at least `MIN_BANNER_PHOTOS`) so the dashboard can upload
   * more images. Was a fixed 5-tuple, which made "add another photo"
   * impossible.
   */
  bannerPhotos: TourBannerPhotoInput[]
  /** Meeting point & itinerary rows, editable at /admin/tour-config. */
  itineraryStops: ItineraryStop[]
}

export type LouvreTour = Omit<TourSettingsInput['tour'], 'ogImage'> & {
  ogImage: string
}

export type ResolvedTourConfig = {
  louvreTour: LouvreTour
  faqs: TourFaqItem[]
  importantInfo: TourImportantInfoSection[]
  bannerPhotos: BannerPhoto[]
  itineraryStops: ItineraryStop[]
}
