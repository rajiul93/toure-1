/**
 * Serialises a JSON-LD graph for injection into a `<script>` tag.
 *
 * `JSON.stringify` does not escape `<`, so any admin-authored string that
 * contains `</script>` (a blog title, meta description, keyword…) would close
 * the script element early and inject the rest as markup. Escaping the three
 * characters below is the standard fix and keeps the JSON valid — `<` and
 * friends parse back to the original characters.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
