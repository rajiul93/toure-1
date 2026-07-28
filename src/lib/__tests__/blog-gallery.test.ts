import { buildPublicBlogGalleryImages, parseBlogGalleryImages, serializeBlogGalleryImages } from '@/lib/blog-gallery'

describe('parseBlogGalleryImages', () => {
  it('returns an empty array for invalid input', () => {
    expect(parseBlogGalleryImages(null)).toEqual([])
    expect(parseBlogGalleryImages({})).toEqual([])
  })

  it('keeps valid gallery items', () => {
    expect(
      parseBlogGalleryImages([
        { id: 'a', url: ' https://cdn.test/1.png ', alt_text: ' One ' },
        { id: '', url: 'x', alt_text: 'bad' },
      ]),
    ).toEqual([{ id: 'a', url: 'https://cdn.test/1.png', alt_text: 'One' }])
  })
})

describe('serializeBlogGalleryImages', () => {
  it('drops empty urls', () => {
    expect(
      serializeBlogGalleryImages([
        { id: 'a', url: 'https://cdn.test/1.png', alt_text: 'One' },
        { id: 'b', url: '   ', alt_text: 'Empty' },
      ]),
    ).toEqual([{ id: 'a', url: 'https://cdn.test/1.png', alt_text: 'One' }])
  })
})

describe('buildPublicBlogGalleryImages', () => {
  it('puts featured first then gallery in admin order', () => {
    expect(
      buildPublicBlogGalleryImages(
        { url: 'https://cdn.test/featured.png', alt_text: 'Featured' },
        [
          { id: '1', url: 'https://cdn.test/1.png', alt_text: 'One' },
          { id: '2', url: 'https://cdn.test/2.png', alt_text: 'Two' },
        ],
      ),
    ).toEqual([
      { id: '__featured__', url: 'https://cdn.test/featured.png', alt_text: 'Featured' },
      { id: '1', url: 'https://cdn.test/1.png', alt_text: 'One' },
      { id: '2', url: 'https://cdn.test/2.png', alt_text: 'Two' },
    ])
  })

  it('skips duplicate featured url in gallery list', () => {
    expect(
      buildPublicBlogGalleryImages(
        { url: 'https://cdn.test/featured.png', alt_text: 'Featured' },
        [
          { id: '1', url: 'https://cdn.test/featured.png', alt_text: 'Dup' },
          { id: '2', url: 'https://cdn.test/2.png', alt_text: 'Two' },
        ],
      ),
    ).toEqual([
      { id: '__featured__', url: 'https://cdn.test/featured.png', alt_text: 'Featured' },
      { id: '2', url: 'https://cdn.test/2.png', alt_text: 'Two' },
    ])
  })

  it('falls back to featured image when gallery is empty', () => {
    expect(
      buildPublicBlogGalleryImages(
        { url: 'https://cdn.test/featured.png', alt_text: 'Featured' },
        [],
      ),
    ).toEqual([
      { id: '__featured__', url: 'https://cdn.test/featured.png', alt_text: 'Featured' },
    ])
  })
})
