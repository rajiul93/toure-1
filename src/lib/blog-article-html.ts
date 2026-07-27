import DOMPurify from 'isomorphic-dompurify'

const TABLE_BLOCK_PLACEHOLDER = '__BLOG_TABLE_BLOCK__'

/**
 * Tags the Quill editor can legitimately produce. Anything else — notably
 * <script>, <iframe>, <object>, <form> — is dropped.
 */
const ALLOWED_TAGS = [
  'p', 'br', 'hr', 'span', 'div',
  'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'mark', 'small',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
]

/**
 * `style` is allowed because Quill uses it for alignment/indent; DOMPurify
 * parses and rewrites the CSS, so `expression()`/`url(javascript:)` cannot
 * survive. Event handlers (`on*`) are never allowed.
 */
const ALLOWED_ATTR = [
  'href', 'target', 'rel',
  'src', 'alt', 'title', 'width', 'height', 'loading', 'decoding',
  'class', 'style',
  'colspan', 'rowspan', 'span',
  'data-row-id', 'data-col-id', 'data-table-id',
]

// NOTE: deliberately no `USE_PROFILES` — setting it makes DOMPurify ignore
// ALLOWED_TAGS/ALLOWED_ATTR entirely, which silently dropped colspan/target.
const SANITIZE_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  // NOTE: no custom `ALLOWED_URI_REGEXP`. DOMPurify applies it to *every*
  // attribute that isn't on its URI-safe list, so a URL-shaped pattern also
  // strips plain values like `colspan="2"` and `target="_blank"`. The built-in
  // default already rejects `javascript:` and `data:` while allowing those.
  // Defence in depth even though these tags are not in the allowlist.
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'svg', 'math'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'formaction', 'srcset', 'ping'],
}

/** `url()` and `expression()` are the only script vectors left in inline CSS. */
const UNSAFE_STYLE = /(?:url\s*\(|expression\s*\(|@import)/i

let hookRegistered = false

function registerHooks() {
  if (hookRegistered) return
  hookRegistered = true

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    // `Element` is not a global in the Node/server build, so `instanceof
    // Element` throws there — duck-type the element API instead.
    const el = node as Partial<Element>
    if (
      typeof el.getAttribute !== 'function' ||
      typeof el.setAttribute !== 'function' ||
      typeof el.removeAttribute !== 'function'
    ) {
      return
    }

    // Any link that opens a new tab must not hand the opener window to the
    // destination page.
    if (el.tagName === 'A' && el.getAttribute('target')) {
      el.setAttribute('rel', 'noopener noreferrer')
    }

    // Quill needs `style` for alignment/width, but nothing legitimate in blog
    // content loads a URL from CSS.
    const style = el.getAttribute('style')
    if (style && UNSAFE_STYLE.test(style)) {
      el.removeAttribute('style')
    }
  })
}

/**
 * Strips untrusted markup from editor-authored HTML.
 *
 * Blog bodies and FAQ answers are written by any team member (including the
 * lowest `marketer` role) and rendered with `dangerouslySetInnerHTML` on public
 * pages, so this is the boundary that prevents stored XSS.
 */
export function sanitizeBlogHtml(html: string): string {
  if (!html) return ''
  registerHooks()
  return DOMPurify.sanitize(html, SANITIZE_CONFIG)
}

function cleanQuillHtml(html: string): string {
  return html
    .replace(/<span class="ql-ui"[^>]*><\/span>/gi, '')
    .replace(/\scontenteditable="false"/gi, '')
}

export function prepareBlogArticleHtml(html: string): string {
  if (!html) return html

  // Sanitize first; everything added below is our own trusted markup.
  let output = cleanQuillHtml(sanitizeBlogHtml(html))

  if (output.includes('<table')) {
    const placeholders: string[] = []

    // `[^"]*` so a wrapper that already carries extra classes (e.g. from a
    // previous pass) is still recognised and not wrapped a second time.
    output = output.replace(/<div class="ql-table-wrapper[^"]*"[\s\S]*?<\/div>/gi, (block) => {
      const index = placeholders.length
      placeholders.push(
        block.includes('blog-table-scroll')
          ? block
          : block.replace('ql-table-wrapper"', 'ql-table-wrapper blog-table-scroll"'),
      )
      return `${TABLE_BLOCK_PLACEHOLDER}${index}${TABLE_BLOCK_PLACEHOLDER}`
    })

    output = output.replace(/<table\b[\s\S]*?<\/table>/gi, (table) => {
      return `<div class="blog-table-scroll">${table}</div>`
    })

    placeholders.forEach((block, index) => {
      output = output.replace(`${TABLE_BLOCK_PLACEHOLDER}${index}${TABLE_BLOCK_PLACEHOLDER}`, block)
    })
  }

  return output
}
