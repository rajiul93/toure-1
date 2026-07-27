import { prisma } from '@/lib/db'

const BLOB_IMG_TAG_REGEX = /<img\b[^>]*\bsrc=(["'])blob:[^"']*\1[^>]*>/gi

function extractAttribute(tag: string, attribute: string): string | null {
  const match = tag.match(new RegExp(`\\b${attribute}=(["'])([^"']*)\\1`, 'i'))
  return match?.[2]?.trim() ?? null
}

function filenameHintFromAlt(alt: string): string {
  return alt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function findUploadedImageForAlt(alt: string) {
  const trimmedAlt = alt.trim()
  if (!trimmedAlt) return null

  const filenameHint = filenameHintFromAlt(trimmedAlt)

  return prisma.image.findFirst({
    where: {
      OR: [
        { alt: { equals: trimmedAlt, mode: 'insensitive' } },
        ...(filenameHint
          ? [{ filename: { contains: filenameHint, mode: 'insensitive' as const } }]
          : []),
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: { url: true },
  })
}

export async function repairBlobImagesInHtml(html: string): Promise<string> {
  if (!html.includes('blob:')) return html

  const tags = [...html.matchAll(BLOB_IMG_TAG_REGEX)].map((match) => match[0])
  if (tags.length === 0) return html

  let output = html

  for (const tag of tags) {
    const alt = extractAttribute(tag, 'alt')
    if (!alt) continue

    const image = await findUploadedImageForAlt(alt)
    if (!image?.url) continue

    const repairedTag = tag.replace(/\bsrc=(["'])blob:[^"']*\1/i, `src="${image.url}"`)
    output = output.replace(tag, repairedTag)
  }

  return output
}

export async function repairBlogHtmlContent(content: {
  description: string
  faqs: Array<{ id?: string; question: string; answer: string }>
}) {
  const description = await repairBlobImagesInHtml(content.description)
  const faqs = await Promise.all(
    content.faqs.map(async (faq) => ({
      ...faq,
      answer: await repairBlobImagesInHtml(faq.answer),
    })),
  )

  return { description, faqs }
}

export function blogHtmlNeedsRepair(content: {
  description: string
  faqs: Array<{ answer: string }>
}) {
  if (content.description.includes('blob:')) return true
  return content.faqs.some((faq) => faq.answer.includes('blob:'))
}

type BlogHtmlRecord = {
  id: string
  description: string
  faqs: Array<{ id: string; question: string; answer: string; sortOrder?: number }>
}

export async function repairBlogRecordInDBIfNeeded<T extends BlogHtmlRecord>(
  blog: T,
): Promise<T> {
  if (!blogHtmlNeedsRepair({ description: blog.description, faqs: blog.faqs })) {
    return blog
  }

  const repaired = await repairBlogHtmlContent({
    description: blog.description,
    faqs: blog.faqs,
  })

  await prisma.$transaction(async (tx) => {
    await tx.blog.update({
      where: { id: blog.id },
      data: { description: repaired.description },
    })

    for (const [index, faq] of blog.faqs.entries()) {
      const nextAnswer = repaired.faqs[index]?.answer
      if (!nextAnswer || nextAnswer === faq.answer) continue

      await tx.blogFaq.update({
        where: { id: faq.id },
        data: { answer: nextAnswer },
      })
    }
  })

  return {
    ...blog,
    description: repaired.description,
    faqs: blog.faqs.map((faq, index) => ({
      ...faq,
      answer: repaired.faqs[index]?.answer ?? faq.answer,
    })),
  }
}
