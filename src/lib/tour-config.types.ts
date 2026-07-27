export type TourBannerPhotoInput = {
  url: string
  alt_text: string
  label: string
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
  bannerPhotos: [
    TourBannerPhotoInput,
    TourBannerPhotoInput,
    TourBannerPhotoInput,
    TourBannerPhotoInput,
    TourBannerPhotoInput,
  ]
}

export type LouvreTour = Omit<TourSettingsInput['tour'], 'ogImage'> & {
  ogImage: string
}

export type ResolvedTourConfig = {
  louvreTour: LouvreTour
  faqs: TourFaqItem[]
  importantInfo: TourImportantInfoSection[]
  bannerPhotos: BannerPhoto[]
}
