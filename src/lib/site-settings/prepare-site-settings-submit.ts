import { uploadEditorImage } from '@/lib/quill/upload-editor-image'
import type { SiteSettingsFormValues } from '@/lib/validations/site-settings.validation'
import { usePendingImageStore } from '@/store/pending-image-store'

export async function prepareSiteSettingsForSubmit(
  values: SiteSettingsFormValues,
): Promise<SiteSettingsFormValues> {
  const logoUrl = values.brand.logo.url

  if (!logoUrl.startsWith('blob:')) {
    return values
  }

  const file = usePendingImageStore.getState().getFileByPreviewUrl(logoUrl)
  if (!file) {
    throw new Error('Logo file is missing. Please select the logo again.')
  }

  const remoteUrl = await uploadEditorImage(file, values.brand.logo.alt_text)

  return {
    ...values,
    brand: {
      ...values.brand,
      logo: {
        ...values.brand.logo,
        url: remoteUrl,
      },
    },
  }
}
