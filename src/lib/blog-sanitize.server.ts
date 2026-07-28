/**
 * Lazy-load DOMPurify so read-only blog API routes (list/get) never pull jsdom
 * into the serverless bundle at module evaluation time.
 */
export async function sanitizeBlogHtmlForSave(html: string): Promise<string> {
  const { sanitizeBlogHtml } = await import('@/lib/blog-article-html')
  return sanitizeBlogHtml(html)
}
