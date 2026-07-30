import { MIN_GALLERY_PHOTOS } from '@/lib/attraction-tour-detail'
import {
  buildAttractionTourSeo,
  htmlToExcerpt,
  mapTourRecordToCard,
  mapTourRecordToDetail,
  toBannerPhotos,
  type AttractionTourWithReviews,
} from '@/lib/attraction-tour-mapper'

function galleryPhoto(overrides: Record<string, unknown> = {}) {
  return {
    id: 'photo-1',
    url: '/images/attractions/a.webp',
    alt: 'Alt A',
    label: 'Label A',
    featured: false,
    ...overrides,
  }
}

function tourRecord(overrides: Partial<AttractionTourWithReviews> = {}) {
  return {
    id: 'tour_1',
    slug: 'orsay-museum',
    title: 'Orsay Museum',
    isPublished: true,
    isDeleted: false,
    ratingAverage: 4.7,
    reviewCount: 1280,
    priceFrom: '€39',
    priceNote: 'per person',
    primaryCta: 'Check availability',
    secondaryOptions: ['Reserve now & pay later'],
    overviewDescription: '<p>Impressionist masterpieces in a former railway station.</p>',
    highlightsHtml: '<ul><li>Skip the line</li></ul>',
    lovedTags: ['Great value'],
    lovedQuotes: ['Loved it.'],
    meetingPointAddress: '1 Rue de la Légion d’Honneur, Paris',
    questionsDescription: 'We can help.',
    questionsCtaLabel: 'Contact us',
    questionsCtaHref: '/about-us',
    galleryPhotos: [
      galleryPhoto({ id: 'p1', url: '/a.webp', label: 'A' }),
      galleryPhoto({ id: 'p2', url: '/b.webp', label: 'B', featured: true }),
      galleryPhoto({ id: 'p3', url: '/c.webp', label: 'C' }),
    ],
    importantInfo: [{ id: 'inclusion', title: 'Inclusion', html: '<ul><li>Ticket</li></ul>' }],
    travelerPhotos: [],
    reviews: [],
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [],
    ogImageUrl: '',
    ogImageAlt: '',
    bokunChannel: '',
    bokunExperienceId: '',
    createdAt: new Date('2026-07-01T00:00:00Z'),
    updatedAt: new Date('2026-07-02T00:00:00Z'),
    ...overrides,
  } as unknown as AttractionTourWithReviews
}

describe('toBannerPhotos', () => {
  it('renames url → src for the public renderer', () => {
    expect(toBannerPhotos([galleryPhoto({ url: '/x.webp', alt: 'X', label: 'L' })])).toEqual([
      { src: '/x.webp', alt: 'X', label: 'L', featured: true },
    ])
  })

  it('hoists the feature image to the first slot', () => {
    const photos = toBannerPhotos([
      galleryPhoto({ url: '/a.webp' }),
      galleryPhoto({ url: '/b.webp', featured: true }),
      galleryPhoto({ url: '/c.webp' }),
    ])

    expect(photos.map((photo) => photo.src)).toEqual(['/b.webp', '/a.webp', '/c.webp'])
    expect(photos.map((photo) => photo.featured)).toEqual([true, false, false])
  })

  it('drops photos with an empty url', () => {
    expect(toBannerPhotos([galleryPhoto({ url: '   ' }), galleryPhoto({ url: '/ok.webp' })])).toHaveLength(1)
  })

  it('returns an empty array when nothing is configured', () => {
    expect(toBannerPhotos([])).toEqual([])
  })
})

describe('mapTourRecordToDetail', () => {
  it('puts the feature image in the large hero slot', () => {
    const detail = mapTourRecordToDetail(tourRecord())
    expect(detail.gallery.bannerPhotos[0].src).toBe('/b.webp')
    expect(detail.gallery.bannerPhotos[0].featured).toBe(true)
  })

  it('pads the gallery to the browsable minimum and caps the hero at five', () => {
    const detail = mapTourRecordToDetail(tourRecord())
    expect(detail.gallery.galleryPhotos).toHaveLength(MIN_GALLERY_PHOTOS)
    expect(detail.gallery.bannerPhotos).toHaveLength(5)
  })

  it('orders reviews by sortOrder regardless of DB row order', () => {
    const detail = mapTourRecordToDetail(
      tourRecord({
        reviews: [
          { id: 'r2', reviewer: 'Bea', reviewDate: 'Jun 2026', rating: 4, text: 'Second', sortOrder: 1 },
          { id: 'r1', reviewer: 'Ann', reviewDate: 'Jul 2026', rating: 5, text: 'First', sortOrder: 0 },
        ],
      } as unknown as Partial<AttractionTourWithReviews>),
    )

    expect(detail.reviews.list.map((review) => review.reviewer)).toEqual(['Ann', 'Bea'])
    expect(detail.reviews.list[0]).toEqual({
      reviewer: 'Ann',
      date: 'Jul 2026',
      rating: 5,
      text: 'First',
    })
  })

  it('drops sections whose editor was left blank', () => {
    const detail = mapTourRecordToDetail(
      tourRecord({
        importantInfo: [
          { id: 'inclusion', title: 'Inclusion', html: '<ul><li>Ticket</li></ul>' },
          // What Quill stores for a section the admin cleared.
          { id: 'exclusion', title: 'Exclusion', html: '<p><br></p>' },
          { id: 'extra', title: 'Extra', html: '' },
        ],
      } as unknown as Partial<AttractionTourWithReviews>),
    )

    expect(detail.importantInformation).toHaveLength(1)
    expect(detail.importantInformation[0].id).toBe('inclusion')
    expect(detail.importantInformation[0].html).toBe('<ul><li>Ticket</li></ul>')
  })

  it('passes the Quill-authored overview HTML through unchanged', () => {
    const detail = mapTourRecordToDetail(tourRecord())

    expect(detail.overview.description).toBe(
      '<p>Impressionist masterpieces in a former railway station.</p>',
    )
    expect(detail.overview.highlightsHtml).toBe('<ul><li>Skip the line</li></ul>')
  })

  it('tolerates a section object missing its html key', () => {
    const detail = mapTourRecordToDetail(
      tourRecord({
        importantInfo: [{ id: 'inclusion', title: 'Inclusion' }],
      } as unknown as Partial<AttractionTourWithReviews>),
    )

    expect(detail.importantInformation).toEqual([])
  })

  it('falls back to hero photos when no traveler photos are set', () => {
    const detail = mapTourRecordToDetail(tourRecord())
    expect(detail.travelerPhotos).toHaveLength(4)
    expect(detail.travelerPhotos[0].url).toBe('/b.webp')
  })

  it('uses configured traveler photos when present', () => {
    const detail = mapTourRecordToDetail(
      tourRecord({
        travelerPhotos: [
          { url: '/t1.webp', alt: 'Traveler one' },
          { url: '  ', alt: 'Dropped' },
        ],
      } as unknown as Partial<AttractionTourWithReviews>),
    )

    expect(detail.travelerPhotos).toEqual([{ url: '/t1.webp', alt: 'Traveler one' }])
  })

  it('carries the booking panel and breadcrumb through', () => {
    const detail = mapTourRecordToDetail(tourRecord())

    expect(detail.bookingPanel).toEqual({
      priceFrom: '€39',
      priceNote: 'per person',
      primaryCta: 'Check availability',
      secondaryOptions: ['Reserve now & pay later'],
    })
    expect(detail.breadcrumb.at(-1)).toEqual({ label: 'Orsay Museum', url: null })
  })

  it('survives malformed JSON columns instead of throwing', () => {
    const detail = mapTourRecordToDetail(
      tourRecord({
        galleryPhotos: null,
        importantInfo: null,
        travelerPhotos: null,
      } as unknown as Partial<AttractionTourWithReviews>),
    )

    expect(detail.gallery.galleryPhotos).toEqual([])
    expect(detail.importantInformation).toEqual([])
    expect(detail.travelerPhotos).toEqual([])
  })
})

describe('htmlToExcerpt', () => {
  it('strips the tags a listing card would otherwise print literally', () => {
    expect(htmlToExcerpt('<p>The <strong>Orsay</strong> is a museum.</p>')).toBe(
      'The Orsay is a museum.',
    )
  })

  it('keeps words from adjacent blocks apart', () => {
    expect(htmlToExcerpt('<p>First sentence.</p><p>Second sentence.</p>')).toBe(
      'First sentence. Second sentence.',
    )
    expect(htmlToExcerpt('<ul><li>One</li><li>Two</li></ul>')).toBe('One Two')
  })

  it('collapses the blank-line markup Quill inserts', () => {
    expect(htmlToExcerpt('<p>A.</p><p><br></p><p>B.</p>')).toBe('A. B.')
  })

  it('decodes named and numeric entities', () => {
    expect(htmlToExcerpt('<p>Tickets &amp; tours &#39;26 &nbsp;now</p>')).toBe(
      "Tickets & tours '26 now",
    )
  })

  it('truncates on a word boundary', () => {
    const result = htmlToExcerpt('<p>alpha bravo charlie delta echo foxtrot</p>', 20)

    expect(result.length).toBeLessThanOrEqual(21)
    // Cut lands between words — "charlie" is whole, "delta" is dropped entirely.
    expect(result).toBe('alpha bravo charlie…')
  })

  it('leaves short text untouched', () => {
    expect(htmlToExcerpt('<p>Short.</p>', 100)).toBe('Short.')
  })

  it('returns an empty string for empty or tag-only input', () => {
    expect(htmlToExcerpt('')).toBe('')
    expect(htmlToExcerpt('<p><br></p>')).toBe('')
  })
})

describe('mapTourRecordToCard', () => {
  it('links to the public detail route and uses the feature image', () => {
    const card = mapTourRecordToCard(tourRecord())

    expect(card.href).toBe('/attraction-tours/orsay-museum')
    expect(card.imageUrl).toBe('/b.webp')
    expect(card.rating).toBe(4.7)
    expect(card.reviewCount).toBe(1280)
  })

  it('returns an empty image rather than crashing when the gallery is empty', () => {
    expect(mapTourRecordToCard(tourRecord({ galleryPhotos: [] })).imageUrl).toBe('')
  })
})

describe('buildAttractionTourSeo', () => {
  const feature = { src: '/feature.webp', alt: 'Feature alt', label: 'F', featured: true }

  it('uses the dashboard values when they are set', () => {
    const seo = buildAttractionTourSeo(
      {
        title: 'Orsay Museum',
        metaTitle: 'Orsay Museum Tickets | Skip the Line',
        metaDescription: 'Book timed entry to the Orsay.',
        metaKeywords: ['orsay', 'paris'],
        ogImageUrl: '/social.webp',
        ogImageAlt: 'Social alt',
        overviewDescription: '<p>Ignored when metaDescription is set.</p>',
      },
      feature,
    )

    expect(seo).toEqual({
      metaTitle: 'Orsay Museum Tickets | Skip the Line',
      metaDescription: 'Book timed entry to the Orsay.',
      metaKeywords: ['orsay', 'paris'],
      ogImage: { url: '/social.webp', alt: 'Social alt' },
    })
  })

  it('falls back to the tour title and a plain-text overview excerpt', () => {
    const seo = buildAttractionTourSeo(
      {
        title: 'Orsay Museum',
        metaTitle: '   ',
        metaDescription: '',
        metaKeywords: [],
        ogImageUrl: '',
        ogImageAlt: '',
        overviewDescription: '<p>Impressionist <strong>masterpieces</strong> by the Seine.</p>',
      },
      feature,
    )

    expect(seo.metaTitle).toBe('Orsay Museum')
    // Must be plain text — raw HTML in a meta description would ship tags.
    expect(seo.metaDescription).toBe('Impressionist masterpieces by the Seine.')
    expect(seo.metaDescription).not.toContain('<')
  })

  it('falls back to the gallery feature image for social sharing', () => {
    const seo = buildAttractionTourSeo(
      {
        title: 'Orsay Museum',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: [],
        ogImageUrl: '',
        ogImageAlt: '',
        overviewDescription: '<p>x</p>',
      },
      feature,
    )

    expect(seo.ogImage).toEqual({ url: '/feature.webp', alt: 'Feature alt' })
  })

  it('falls back to the title for alt text when the tour has no photos at all', () => {
    const seo = buildAttractionTourSeo({
      title: 'Orsay Museum',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
      ogImageUrl: '',
      ogImageAlt: '',
      overviewDescription: '<p>x</p>',
    })

    expect(seo.ogImage).toEqual({ url: '', alt: 'Orsay Museum' })
  })

  it('drops blank keywords', () => {
    const seo = buildAttractionTourSeo({
      title: 'T',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: ['paris', '  ', ''],
      ogImageUrl: '',
      ogImageAlt: '',
      overviewDescription: '<p>x</p>',
    })

    expect(seo.metaKeywords).toEqual(['paris'])
  })
})

describe('mapTourRecordToDetail — seo and bokun', () => {
  it('exposes a resolved seo block and the raw bokun target', () => {
    const detail = mapTourRecordToDetail(
      tourRecord({
        metaTitle: 'Custom title',
        bokunChannel: 'chan-1',
        bokunExperienceId: '999',
      } as unknown as Partial<AttractionTourWithReviews>),
    )

    expect(detail.seo.metaTitle).toBe('Custom title')
    expect(detail.bokun).toEqual({ channel: 'chan-1', experienceId: '999' })
  })

  it('leaves bokun blank when the tour has no override', () => {
    expect(mapTourRecordToDetail(tourRecord()).bokun).toEqual({
      channel: '',
      experienceId: '',
    })
  })
})
