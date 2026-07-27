import { deleteObjectFromR2, uploadObjectToR2 } from '@/lib/r2/client'
import {
  getPublicObjectUrl,
  IMAGE_UPLOAD,
  isAllowedImageMimeType,
} from '@/lib/r2/config'
import { prisma } from '@/lib/db'
import { dayjs } from '@/lib/dayjs'
import type { RegisterImageUsageInput } from '@/lib/validations/image.validation'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

function sanitizeFilename(filename: string): string {
  const base = path.basename(filename).toLowerCase()
  const safe = base.replace(/[^a-z0-9.-]+/g, '-').replace(/-+/g, '-')
  return safe || 'image'
}

function buildObjectKey(filename: string): string {
  const now = dayjs.utc()
  const year = now.format('YYYY')
  const month = now.format('MM')
  return `uploads/${year}/${month}/${randomUUID()}-${sanitizeFilename(filename)}`
}

function validateUploadFile(file: File) {
  if (!file || file.size === 0) {
    throw new Error('Image file is required')
  }

  if (file.size > IMAGE_UPLOAD.maxBytes) {
    throw new Error('Image must be 10 MB or smaller')
  }

  if (!isAllowedImageMimeType(file.type)) {
    throw new Error('Only JPEG, PNG, WebP, GIF, and AVIF images are allowed')
  }
}

async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function listImagesFromDB(params: {
  page: number
  limit: number
  search?: string
}) {
  const skip = (params.page - 1) * params.limit
  const search = params.search?.trim()

  const where = search
    ? {
        OR: [
          { filename: { contains: search, mode: 'insensitive' as const } },
          { alt: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : undefined

  const [items, total] = await Promise.all([
    prisma.image.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: params.limit,
      include: {
        _count: {
          select: { usages: true },
        },
      },
    }),
    prisma.image.count({ where }),
  ])

  return {
    items: items.map((item) => ({
      id: item.id,
      url: item.url,
      filename: item.filename,
      mimeType: item.mimeType,
      size: item.size,
      alt: item.alt,
      uploadedBy: item.uploadedBy,
      usageCount: item._count.usages,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    page: params.page,
    limit: params.limit,
    total,
    totalPages: Math.ceil(total / params.limit),
  }
}

export async function getImageFromDB(id: string) {
  const image = await prisma.image.findUnique({
    where: { id },
    include: {
      usages: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!image) return null

  return {
    id: image.id,
    url: image.url,
    key: image.key,
    filename: image.filename,
    mimeType: image.mimeType,
    size: image.size,
    alt: image.alt,
    uploadedBy: image.uploadedBy,
    usages: image.usages.map((usage) => ({
      id: usage.id,
      entityType: usage.entityType,
      entityId: usage.entityId,
      field: usage.field,
      createdAt: usage.createdAt.toISOString(),
    })),
    createdAt: image.createdAt.toISOString(),
    updatedAt: image.updatedAt.toISOString(),
  }
}

export async function uploadImageToR2AndDB(params: {
  file: File
  alt?: string | null
  uploadedBy: string
}) {
  validateUploadFile(params.file)

  const key = buildObjectKey(params.file.name)
  const body = await fileToBuffer(params.file)

  await uploadObjectToR2({
    key,
    body,
    mimeType: params.file.type,
  })

  const image = await prisma.image.create({
    data: {
      key,
      url: getPublicObjectUrl(key),
      filename: params.file.name,
      mimeType: params.file.type,
      size: params.file.size,
      alt: params.alt?.trim() || null,
      uploadedBy: params.uploadedBy,
    },
  })

  return {
    id: image.id,
    url: image.url,
    filename: image.filename,
    mimeType: image.mimeType,
    size: image.size,
    alt: image.alt,
    uploadedBy: image.uploadedBy,
    createdAt: image.createdAt.toISOString(),
    updatedAt: image.updatedAt.toISOString(),
  }
}

export async function updateImageInR2AndDB(params: {
  id: string
  file?: File | null
  alt?: string | null
}) {
  const existing = await prisma.image.findUnique({
    where: { id: params.id },
  })

  if (!existing) {
    throw new Error('Image not found')
  }

  const alt =
    params.alt === undefined ? existing.alt : params.alt?.trim() || null

  if (!params.file) {
    const updated = await prisma.image.update({
      where: { id: params.id },
      data: { alt },
    })

    return {
      id: updated.id,
      url: updated.url,
      filename: updated.filename,
      mimeType: updated.mimeType,
      size: updated.size,
      alt: updated.alt,
      uploadedBy: updated.uploadedBy,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    }
  }

  validateUploadFile(params.file)

  const nextKey = buildObjectKey(params.file.name)
  const body = await fileToBuffer(params.file)

  await uploadObjectToR2({
    key: nextKey,
    body,
    mimeType: params.file.type,
  })

  const updated = await prisma.image.update({
    where: { id: params.id },
    data: {
      key: nextKey,
      url: getPublicObjectUrl(nextKey),
      filename: params.file.name,
      mimeType: params.file.type,
      size: params.file.size,
      alt,
    },
  })

  try {
    await deleteObjectFromR2(existing.key)
  } catch {
    // New file is live; old object cleanup can be retried manually if needed.
  }

  return {
    id: updated.id,
    url: updated.url,
    filename: updated.filename,
    mimeType: updated.mimeType,
    size: updated.size,
    alt: updated.alt,
    uploadedBy: updated.uploadedBy,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  }
}

export async function deleteImageFromR2AndDB(id: string) {
  const existing = await prisma.image.findUnique({
    where: { id },
    include: {
      usages: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!existing) {
    throw new Error('Image not found')
  }

  if (existing.usages.length > 0) {
    return {
      deleted: false as const,
      usages: existing.usages.map((usage) => ({
        id: usage.id,
        entityType: usage.entityType,
        entityId: usage.entityId,
        field: usage.field,
      })),
    }
  }

  await prisma.image.delete({ where: { id } })

  try {
    await deleteObjectFromR2(existing.key)
  } catch {
    // DB row is gone; stale R2 object can be cleaned up separately.
  }

  return { deleted: true as const }
}

export async function registerImageUsageInDB(payload: RegisterImageUsageInput) {
  const image = await prisma.image.findUnique({
    where: { id: payload.imageId },
    select: { id: true },
  })

  if (!image) {
    throw new Error('Image not found')
  }

  return prisma.imageUsage.upsert({
    where: {
      imageId_entityType_entityId_field: {
        imageId: payload.imageId,
        entityType: payload.entityType,
        entityId: payload.entityId,
        field: payload.field,
      },
    },
    update: {},
    create: {
      imageId: payload.imageId,
      entityType: payload.entityType,
      entityId: payload.entityId,
      field: payload.field,
    },
  })
}

export async function unregisterImageUsageFromDB(payload: RegisterImageUsageInput) {
  await prisma.imageUsage.deleteMany({
    where: {
      imageId: payload.imageId,
      entityType: payload.entityType,
      entityId: payload.entityId,
      field: payload.field,
    },
  })
}
