import { serializeJsonLd } from '@/lib/json-ld'

describe('serializeJsonLd', () => {
  it('escapes a </script> breakout attempt in admin-authored text', () => {
    // The realistic attack: a blog title saved through the admin CMS.
    const out = serializeJsonLd({ headline: 'Louvre </script><script>alert(1)</script>' })
    expect(out).not.toContain('</script>')
    expect(out).not.toContain('<script')
  })

  it('escapes angle brackets and ampersands everywhere', () => {
    const out = serializeJsonLd({ a: '<', b: '>', c: '&' })
    expect(out).toContain('\\u003c')
    expect(out).toContain('\\u003e')
    expect(out).toContain('\\u0026')
    expect(out).not.toMatch(/[<>&]/)
  })

  it('still produces valid JSON that round-trips to the original values', () => {
    const data = {
      '@context': 'https://schema.org',
      headline: 'Tom & Jerry <b>bold</b>',
      nested: { list: ['a<b', 'c>d'] },
    }
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data)
  })

  it('handles a realistic graph shape', () => {
    const graph = { '@context': 'https://schema.org', '@graph': [{ '@type': 'Organization' }] }
    expect(JSON.parse(serializeJsonLd(graph))).toEqual(graph)
  })
})
