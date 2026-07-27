/** Magic-byte signatures for allowed image uploads. */

type ImageSignature = {
  mime: string
  bytes: number[]
  offset?: number
}

const SIGNATURES: ImageSignature[] = [
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 },
  // WebP also has `WEBP` at offset 8 — checked separately.
]

function matchesSignature(buffer: Uint8Array, signature: ImageSignature): boolean {
  const offset = signature.offset ?? 0
  if (buffer.length < offset + signature.bytes.length) return false

  for (let i = 0; i < signature.bytes.length; i += 1) {
    if (buffer[offset + i] !== signature.bytes[i]) return false
  }

  if (signature.mime === 'image/webp') {
    if (buffer.length < 12) return false
    const tag = String.fromCharCode(buffer[8], buffer[9], buffer[10], buffer[11])
    return tag === 'WEBP'
  }

  return true
}

export function detectImageMimeType(buffer: Uint8Array): string | null {
  for (const signature of SIGNATURES) {
    if (matchesSignature(buffer, signature)) {
      return signature.mime
    }
  }
  return null
}

export function assertImageBuffer(buffer: Uint8Array, declaredMime: string): string {
  const detected = detectImageMimeType(buffer)

  if (!detected) {
    throw new Error('File content is not a supported image format')
  }

  // Allow jpeg/png/gif/webp/avif declared types; map avif to detected if needed.
  const normalizedDeclared = declaredMime.toLowerCase().split(';')[0]?.trim() ?? ''
  const allowedDeclared = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']

  if (!allowedDeclared.includes(normalizedDeclared)) {
    throw new Error('Unsupported image type')
  }

  // AVIF shares no simple magic bytes in this lightweight checker — rely on declared
  // type only when the first bytes look like an ISO BMFF `ftyp` box.
  if (normalizedDeclared === 'image/avif') {
    if (buffer.length >= 12) {
      const ftyp = String.fromCharCode(buffer[4], buffer[5], buffer[6], buffer[7])
      if (ftyp === 'ftyp') return 'image/avif'
    }
    throw new Error('File content does not match declared AVIF type')
  }

  if (detected !== normalizedDeclared && !(normalizedDeclared === 'image/jpeg' && detected === 'image/jpeg')) {
    throw new Error('File content does not match declared image type')
  }

  return detected
}
