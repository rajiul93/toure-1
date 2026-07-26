export const HOME_SCROLL_OFFSET = 112

export const HOME_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'inclusions', label: 'Inclusions' },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'meeting-point', label: 'Meeting point' },
  { id: 'important-info', label: 'Important info' },
  { id: 'faq', label: 'FAQ' },
  { id: 'reviews', label: 'Reviews' },
] as const

export type HomeSectionId = (typeof HOME_SECTIONS)[number]['id']

export function scrollToHomeSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return false

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const top = el.getBoundingClientRect().top + window.scrollY - HOME_SCROLL_OFFSET

  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReduced ? 'auto' : 'smooth',
  })

  window.history.pushState(null, '', `#${id}`)
  return true
}

export function scrollToHomeHash(hash: string) {
  const id = hash.replace(/^#/, '')
  if (!id) return
  scrollToHomeSection(id)
}

export function getHomeSectionLinks() {
  return HOME_SECTIONS.map((section) => ({
    href: `/#${section.id}`,
    label: section.label,
  }))
}
