export type QuillImageSettings = {
  alt: string
  width: string
  height: string
}

export function readImageDimension(img: HTMLImageElement, attribute: 'width' | 'height'): string {
  const attr = img.getAttribute(attribute)
  if (attr) return attr.replace(/px$/i, '')

  const styleValue = img.style[attribute]
  if (styleValue) return styleValue

  return ''
}

export function normalizeDimensionInput(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  if (/^\d+$/.test(trimmed)) return trimmed
  if (/^\d+(\.\d+)?px$/i.test(trimmed)) return trimmed.replace(/px$/i, '')
  if (/^\d+(\.\d+)?%$/.test(trimmed)) return trimmed

  return null
}

export function applyQuillImageSettings(
  img: HTMLImageElement,
  settings: QuillImageSettings,
): void {
  img.setAttribute('alt', settings.alt.trim())

  const width = normalizeDimensionInput(settings.width)
  const height = normalizeDimensionInput(settings.height)

  img.removeAttribute('width')
  img.removeAttribute('height')
  img.style.width = ''
  img.style.height = ''

  if (width?.endsWith('%')) {
    img.style.width = width
  } else if (width) {
    img.setAttribute('width', width)
  }

  if (height?.endsWith('%')) {
    img.style.height = height
  } else if (height) {
    img.setAttribute('height', height)
  }
}

export const DEFAULT_QUILL_IMAGE_WIDTH = '400'
