import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getR2Config } from '@/lib/r2/config'

let client: S3Client | undefined

function getR2Client() {
  if (client) return client

  const { endpoint, accessKeyId, secretAccessKey } = getR2Config()

  client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

  return client
}

export async function uploadObjectToR2(params: {
  key: string
  body: Buffer
  mimeType: string
}) {
  const { bucket } = getR2Config()

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.mimeType,
      CacheControl: 'public, max-age=31536000, immutable',
      Metadata: {
        'x-content-type-options': 'nosniff',
      },
    }),
  )
}

export async function deleteObjectFromR2(key: string) {
  const { bucket } = getR2Config()

  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  )
}
