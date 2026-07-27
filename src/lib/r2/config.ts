const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_TYPES)[number]

export const IMAGE_UPLOAD = {
  maxBytes: 10 * 1024 * 1024,
  allowedMimeTypes: ALLOWED_IMAGE_TYPES,
} as const

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} is not configured`)
  }
  return value
}

export function getR2Config() {
  const accountId = requireEnv('R2_ACCOUNT_ID')
  const accessKeyId = requireEnv('R2_ACCESS_KEY_ID')
  const secretAccessKey = requireEnv('R2_SECRET_ACCESS_KEY')
  const bucket = requireEnv('R2_BUCKET_NAME')
  const publicUrl = requireEnv('R2_PUBLIC_URL').replace(/\/$/, '')

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicUrl,
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  }
}

export function getPublicObjectUrl(key: string): string {
  const { publicUrl } = getR2Config()
  return `${publicUrl}/${key}`
}

export function isAllowedImageMimeType(value: string): value is AllowedImageMimeType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(value)
}
