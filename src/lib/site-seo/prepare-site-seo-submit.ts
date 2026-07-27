import { uploadEditorImage } from '@/lib/quill/upload-editor-image'
import type { SiteSeoSettingsFormValues } from '@/lib/validations/site-seo.validation'
import { usePendingImageStore } from '@/store/pending-image-store'

const OG_IMAGE_FIELD_KEY = 'site-seo-og-image'
const ORG_LOGO_FIELD_KEY = 'site-seo-org-logo'

async function resolveImageUrl(previewUrl: string, altText: string): Promise<string> {
  if (!previewUrl.startsWith('blob:')) {
    return previewUrl
  }

  const file = usePendingImageStore.getState().getFileByPreviewUrl(previewUrl)
  if (!file) {
    throw new Error('Image file is missing. Please select the image again.')
  }

  return uploadEditorImage(file, altText)
}

export async function prepareSiteSeoSettingsForSubmit(
  values: SiteSeoSettingsFormValues,
): Promise<SiteSeoSettingsFormValues> {
  const ogDefaultUrl = await resolveImageUrl(
    values.openGraph.defaultImage.url,
    values.openGraph.defaultImage.alt_text,
  )

  const orgLogoUrl = await resolveImageUrl(
    values.organization.logo.url,
    values.organization.logo.alt_text,
  )

  const pages = { ...values.pages }

  for (const key of Object.keys(pages) as Array<keyof typeof pages>) {
    const page = pages[key]
    if (!page.ogImage.url.startsWith('blob:')) continue

    const url = await resolveImageUrl(page.ogImage.url, page.ogImage.alt_text)
    pages[key] = {
      ...page,
      ogImage: {
        ...page.ogImage,
        url,
      },
    }
  }

  return {
    ...values,
    openGraph: {
      ...values.openGraph,
      defaultImage: {
        ...values.openGraph.defaultImage,
        url: ogDefaultUrl,
      },
    },
    organization: {
      ...values.organization,
      logo: {
        ...values.organization.logo,
        url: orgLogoUrl,
      },
    },
    pages,
  }
}

export { OG_IMAGE_FIELD_KEY, ORG_LOGO_FIELD_KEY }
