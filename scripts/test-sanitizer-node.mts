/**
 * Node/server sanitizer regression — uses isomorphic-dompurify's real server path,
 * not Jest's browser dompurify alias.
 */
import { prepareBlogArticleHtml, sanitizeBlogHtml } from '../src/lib/blog-article-html.ts'

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error('FAIL:', message)
    process.exit(1)
  }
}

const tableLink =
  '<table><tr><td colspan="2">cell</td></tr></table><a href="https://example.com" target="_blank">link</a>'

let threw = false
try {
  sanitizeBlogHtml(tableLink)
} catch {
  threw = true
}
assert(!threw, 'sanitizeBlogHtml must not throw on Node (instanceof Element regression)')

const clean = sanitizeBlogHtml(tableLink)
assert(clean.includes('colspan="2"'), 'colspan must survive sanitization')
assert(clean.includes('rel="noopener noreferrer"'), 'target=_blank links must get noopener')

const wrapped = prepareBlogArticleHtml(
  '<div class="ql-table-wrapper"><table><tr><td>a</td></tr></table></div>',
)
assert(wrapped.includes('blog-table-scroll'), 'table wrapper transform must run on Node')

console.log('Node sanitizer checks passed.')
