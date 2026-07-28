import {
  blogFormSchema,
  blogSubmissionSchema,
} from '@/lib/validations/blog-form.validation'

/** Minimal valid payload; individual tests override just what they exercise. */
function buildValues(overrides: Record<string, unknown> = {}) {
  const base = {
    basic_info: {
      blog_date: '2026-07-01',
      publish_date: '2026-07-02',
      publish_status: 'draft',
      is_delete: false,
      author_id: 'author-1',
      tags: ['louvre'],
      keywords: ['louvre'],
      category_id: 'cat-1',
      country_id: 'country-1',
      title: 'A title',
      slug: 'a-title',
      short_description: 'Short description here',
      description: '<p>Body</p>',
      featured_image: { url: 'https://cdn.test/a.png', alt_text: 'alt' },
      gallery: [] as Array<{ id: string; url: string; alt_text: string }>,
      is_featured: false,
    },
    faqs: [],
    meta_data: {
      meta_title: 'Meta title',
      meta_description: 'Meta description',
      meta_image: { url: 'https://cdn.test/m.png', alt_text: 'meta alt' },
    },
    social_meta_data: {
      fb_meta_title: '',
      fb_meta_description: '',
      fb_meta_image: { url: 'https://cdn.test/f.png', alt_text: 'fb alt' },
    },
  }
  return { ...base, ...overrides }
}

function withBlobFeaturedImage() {
  const values = buildValues()
  values.basic_info.featured_image.url = 'blob:http://localhost:3000/9f1c-abc'
  return values
}

describe('blogFormSchema (client resolver)', () => {
  it('accepts a fully uploaded blog', () => {
    expect(blogFormSchema.safeParse(buildValues()).success).toBe(true)
  })

  // Regression: a freshly picked image lives in the form as a `blob:` preview
  // until `prepareBlogFormForSubmit` uploads it — and that only runs *after*
  // validation passes. Rejecting blobs here made the form unsubmittable, so the
  // new image could never be saved.
  it('accepts a pending blob: preview URL so the form can be submitted', () => {
    const result = blogFormSchema.safeParse(withBlobFeaturedImage())
    expect(result.success).toBe(true)
  })

  it('still enforces the publish-date rule', () => {
    const values = buildValues()
    values.basic_info.blog_date = '2026-07-10'
    values.basic_info.publish_date = '2026-07-01'
    const result = blogFormSchema.safeParse(values)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/Publish date cannot be before/)
    }
  })

  it('still requires a title', () => {
    const values = buildValues()
    values.basic_info.title = ''
    expect(blogFormSchema.safeParse(values).success).toBe(false)
  })
})

describe('blogSubmissionSchema (server boundary)', () => {
  it('accepts a fully uploaded blog', () => {
    expect(blogSubmissionSchema.safeParse(buildValues()).success).toBe(true)
  })

  // By the time the API is called, every blob must have been swapped for a real
  // URL. A leftover blob means the upload step silently failed.
  it('rejects a blob: URL that reached the server', () => {
    const result = blogSubmissionSchema.safeParse(withBlobFeaturedImage())
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/unpublished image URLs/)
      expect(result.error.issues[0].path).toEqual([
        'basic_info',
        'featured_image',
        'url',
      ])
    }
  })

  it('rejects a blob: URL left inside the blog body', () => {
    const values = buildValues()
    values.basic_info.description = '<p><img src="blob:http://x/1"></p>'
    expect(blogSubmissionSchema.safeParse(values).success).toBe(false)
  })

  it('rejects a blob: URL left in the gallery', () => {
    const values = buildValues()
    values.basic_info.gallery = [
      { id: 'g1', url: 'blob:http://localhost/g1', alt_text: 'Gallery alt' },
    ]
    const result = blogSubmissionSchema.safeParse(values)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['basic_info', 'gallery', 0, 'url'])
    }
  })

  it('inherits the client rules too', () => {
    const values = buildValues()
    values.basic_info.title = ''
    expect(blogSubmissionSchema.safeParse(values).success).toBe(false)
  })
})
