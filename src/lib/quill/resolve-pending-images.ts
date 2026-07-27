import { defaultAltFromFileName } from '@/lib/image-alt'
import { uploadEditorImage } from '@/lib/quill/upload-editor-image'
import type { BlogFormValues } from '@/lib/validations/blog-form.validation'
import { usePendingImageStore } from '@/store/pending-image-store'

function isBlobUrl(value: string) {
  return value.startsWith('blob:')
}

function containsBlobUrl(value: string) {
  return value.includes('blob:')
}

function assertNoBlobUrls(label: string, value: string) {
  if (containsBlobUrl(value)) {
    throw new Error(
      `${label} still has inline images that were not uploaded. Delete those images in the editor and insert them again using the image button, then save.`,
    )
  }
}

function replaceFieldUrl(value: string, urlMap: Map<string, string>) {
  if (!isBlobUrl(value)) return value
  return urlMap.get(value) ?? value
}

export function replaceBlobUrlsInHtml(html: string, urlMap: Map<string, string>) {
  if (!containsBlobUrl(html) || typeof window === 'undefined') return html
  if (!urlMap.size) return html

  const doc = new DOMParser().parseFromString(html, 'text/html')

  doc.querySelectorAll('img[src^="blob:"]').forEach((node) => {
    const src = node.getAttribute('src')
    if (!src) return

    const remoteUrl = urlMap.get(src)
    if (remoteUrl) {
      node.setAttribute('src', remoteUrl)
    }
  })

  return doc.body.innerHTML
}

export async function uploadPendingImages(
  altByFieldKey: Record<string, string> = {},
): Promise<Map<string, string>> {
  const entries = usePendingImageStore.getState().getUniqueUploadEntries()
  const urlMap = new Map<string, string>()

  for (const entry of entries) {
    if (urlMap.has(entry.previewUrl)) continue

    const alt =
      (entry.fieldKey ? altByFieldKey[entry.fieldKey] : entry.altText)?.trim() ||
      defaultAltFromFileName(entry.file.name)

    const remoteUrl = await uploadEditorImage(entry.file, alt)
    urlMap.set(entry.previewUrl, remoteUrl)
  }

  return urlMap
}

export async function prepareBlogFormForSubmit(values: BlogFormValues): Promise<BlogFormValues> {
  const urlMap = await uploadPendingImages({
    featured_image: values.basic_info.featured_image.alt_text,
    meta_image: values.meta_data.meta_image.alt_text,
    fb_meta_image: values.social_meta_data.fb_meta_image.alt_text,
  })

  const prepared: BlogFormValues = {
    ...values,
    basic_info: {
      ...values.basic_info,
      description: replaceBlobUrlsInHtml(values.basic_info.description, urlMap),
      featured_image: {
        ...values.basic_info.featured_image,
        url: replaceFieldUrl(values.basic_info.featured_image.url, urlMap),
      },
    },
    faqs: values.faqs.map((faq) => ({
      ...faq,
      answer: replaceBlobUrlsInHtml(faq.answer, urlMap),
    })),
    meta_data: {
      ...values.meta_data,
      meta_image: {
        ...values.meta_data.meta_image,
        url: replaceFieldUrl(values.meta_data.meta_image.url, urlMap),
      },
    },
    social_meta_data: {
      ...values.social_meta_data,
      fb_meta_image: {
        ...values.social_meta_data.fb_meta_image,
        url: replaceFieldUrl(values.social_meta_data.fb_meta_image.url, urlMap),
      },
    },
  }

  assertNoBlobUrls('Blog content', prepared.basic_info.description)
  prepared.faqs.forEach((faq, index) => {
    assertNoBlobUrls(`FAQ ${index + 1}`, faq.answer)
  })
  assertNoBlobUrls('Featured image', prepared.basic_info.featured_image.url)
  assertNoBlobUrls('Meta image', prepared.meta_data.meta_image.url)
  if (prepared.social_meta_data.fb_meta_image.url) {
    assertNoBlobUrls('Facebook image', prepared.social_meta_data.fb_meta_image.url)
  }

  return prepared
}
