import {
  MIN_TOUR_GALLERY_PHOTOS,
  attractionTourFormSchema,
  isEmptyRichText,
  attractionTourSubmissionSchema,
  createEmptyAttractionTourValues,
  slugifyTourTitle,
  type AttractionTourFormValues,
  type TourGalleryPhotoValues,
} from '@/lib/validations/attraction-tour.validation'

function photo(overrides: Partial<TourGalleryPhotoValues> = {}): TourGalleryPhotoValues {
  return {
    id: 'photo-1',
    url: '/images/attractions/louvre-1.webp',
    alt: 'Louvre pyramid at dusk',
    label: 'Pyramid',
    featured: false,
    ...overrides,
  }
}

function gallery(count = MIN_TOUR_GALLERY_PHOTOS): TourGalleryPhotoValues[] {
  return Array.from({ length: count }, (_, index) =>
    photo({ id: `photo-${index + 1}`, featured: index === 0 }),
  )
}

function validTour(overrides: Partial<AttractionTourFormValues> = {}): AttractionTourFormValues {
  return {
    ...createEmptyAttractionTourValues(),
    title: 'Louvre Museum',
    slug: 'louvre-museum',
    gallery: gallery(),
    bookingPanel: {
      priceFrom: '€45',
      priceNote: 'per person',
      primaryCta: 'Check availability',
      secondaryOptions: [],
    },
    overview: {
      description: '<p>Skip the line at the Louvre.</p>',
      highlightsHtml: '<ul><li>Skip the line</li></ul>',
    },
    importantInformation: [
      { id: 'inclusion', title: 'Inclusion', html: '<ul><li>Guide</li></ul>' },
    ],
    ...overrides,
  }
}

describe('slugifyTourTitle', () => {
  it('lowercases and hyphenates', () => {
    expect(slugifyTourTitle('Louvre Museum Tour')).toBe('louvre-museum-tour')
  })

  it('strips punctuation and collapses repeated separators', () => {
    expect(slugifyTourTitle('Eiffel Tower:   Summit & Champagne!')).toBe(
      'eiffel-tower-summit-champagne',
    )
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugifyTourTitle('  -- Versailles --  ')).toBe('versailles')
  })

  it('produces a slug the form schema accepts', () => {
    const slug = slugifyTourTitle("Sainte-Chapelle & Conciergerie (2026)")
    expect(attractionTourFormSchema.shape.slug.safeParse(slug).success).toBe(true)
  })
})

describe('attractionTourFormSchema', () => {
  it('accepts a complete tour', () => {
    expect(attractionTourFormSchema.safeParse(validTour()).success).toBe(true)
  })

  it('rejects a gallery below the hero collage minimum', () => {
    const result = attractionTourFormSchema.safeParse(
      validTour({ gallery: gallery(MIN_TOUR_GALLERY_PHOTOS - 1) }),
    )
    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain(
      `at least ${MIN_TOUR_GALLERY_PHOTOS} gallery images`,
    )
  })

  it('requires exactly one feature image', () => {
    const none = gallery().map((item) => ({ ...item, featured: false }))
    expect(JSON.stringify(attractionTourFormSchema.safeParse(validTour({ gallery: none })).error))
      .toContain('Choose a feature image')

    const two = gallery().map((item, index) => ({ ...item, featured: index < 2 }))
    expect(JSON.stringify(attractionTourFormSchema.safeParse(validTour({ gallery: two })).error))
      .toContain('Only one photo can be the feature image')
  })

  it('rejects an uppercase or space-separated slug', () => {
    expect(attractionTourFormSchema.safeParse(validTour({ slug: 'Louvre Museum' })).success).toBe(
      false,
    )
  })

  it('rejects a rating outside 0–5', () => {
    const result = attractionTourFormSchema.safeParse(
      validTour({ rating: { average: 6, reviewCount: 10 } }),
    )
    expect(result.success).toBe(false)
  })

  it('rejects a review rating outside 1–5', () => {
    const review = {
      id: 'r1',
      reviewer: 'Anna',
      date: 'Jul 2026',
      rating: 0,
      text: 'Great tour.',
    }
    expect(attractionTourFormSchema.safeParse(validTour({ reviews: [review] })).success).toBe(false)
    expect(
      attractionTourFormSchema.safeParse(validTour({ reviews: [{ ...review, rating: 5 }] })).success,
    ).toBe(true)
  })

  it('rejects a review missing its text', () => {
    const result = attractionTourFormSchema.safeParse(
      validTour({
        reviews: [{ id: 'r1', reviewer: 'Anna', date: 'Jul 2026', rating: 5, text: '   ' }],
      }),
    )
    expect(result.success).toBe(false)
  })
})

describe('isEmptyRichText', () => {
  it('treats the markup Quill leaves behind for a cleared field as empty', () => {
    expect(isEmptyRichText('')).toBe(true)
    expect(isEmptyRichText('<p><br></p>')).toBe(true)
    expect(isEmptyRichText('<p><br/></p>')).toBe(true)
    expect(isEmptyRichText('<p></p><p><br></p>')).toBe(true)
    expect(isEmptyRichText('<p>&nbsp;</p>')).toBe(true)
    expect(isEmptyRichText('<ul><li></li></ul>')).toBe(true)
  })

  it('treats authored text as content', () => {
    expect(isEmptyRichText('<p>Hello</p>')).toBe(false)
    expect(isEmptyRichText('<ul><li>One</li></ul>')).toBe(false)
  })

  it('counts an embedded image as content even with no text', () => {
    expect(isEmptyRichText('<p><img src="/a.webp" alt=""></p>')).toBe(false)
  })
})

describe('rich-text fields', () => {
  it('rejects an overview description that only looks filled in', () => {
    const result = attractionTourFormSchema.safeParse(
      validTour({
        overview: { description: '<p><br></p>', highlightsHtml: '' },
      }),
    )

    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain('Overview description is required')
  })

  it('accepts an empty highlights editor — highlights are optional', () => {
    const result = attractionTourFormSchema.safeParse(
      validTour({
        overview: { description: '<p>Real text.</p>', highlightsHtml: '<p><br></p>' },
      }),
    )

    expect(result.success).toBe(true)
  })

  it('rejects an important-information section with a blank editor', () => {
    const result = attractionTourFormSchema.safeParse(
      validTour({
        importantInformation: [{ id: 'inclusion', title: 'Inclusion', html: '<p><br></p>' }],
      }),
    )

    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain('Add content for this section')
  })

  it('accepts an empty meeting point address', () => {
    expect(attractionTourFormSchema.safeParse(validTour({ meetingPointAddress: '' })).success).toBe(
      true,
    )
  })
})

describe('attractionTourSubmissionSchema', () => {
  it('accepts blob previews in the client schema but rejects them at the server boundary', () => {
    const withBlob = validTour({
      gallery: gallery().map((item, index) =>
        index === 2 ? { ...item, url: 'blob:http://localhost:3000/abc' } : item,
      ),
    })

    expect(attractionTourFormSchema.safeParse(withBlob).success).toBe(true)

    const result = attractionTourSubmissionSchema.safeParse(withBlob)
    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain('Gallery image 3 has not been uploaded')
  })

  it('rejects an un-uploaded traveler photo', () => {
    const result = attractionTourSubmissionSchema.safeParse(
      validTour({
        travelerPhotos: [{ url: 'blob:http://localhost:3000/xyz', alt: 'Traveler selfie' }],
      }),
    )
    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain('Traveler photo 1 has not been uploaded')
  })

  it('accepts a fully uploaded tour', () => {
    expect(attractionTourSubmissionSchema.safeParse(validTour()).success).toBe(true)
  })
})

describe('createEmptyAttractionTourValues', () => {
  it('starts as an unpublished draft that the schema rejects until filled in', () => {
    const empty = createEmptyAttractionTourValues()
    expect(empty.isPublished).toBe(false)
    expect(attractionTourFormSchema.safeParse(empty).success).toBe(false)
  })

  it('returns a fresh object each call so two forms cannot share arrays', () => {
    const a = createEmptyAttractionTourValues()
    const b = createEmptyAttractionTourValues()
    a.gallery.push(photo())
    expect(b.gallery).toHaveLength(0)
    expect(a.importantInformation).not.toBe(b.importantInformation)
  })
})
