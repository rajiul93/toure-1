import { uploadEditorImage } from '@/lib/quill/upload-editor-image'
import type { TourSettingsFormValues } from '@/lib/validations/tour-settings.validation'
import { usePendingImageStore } from '@/store/pending-image-store'

/**
 * Pending-upload key for a banner photo. Derived from the photo's stable id
 * rather than its position, so reordering doesn't detach a queued file from
 * its row.
 */
export function tourBannerFieldKey(photoId: string): string {
  return `tour-banner-${photoId}`
}

async function resolveImageUrl(previewUrl: string, altText: string): Promise<string> {
  if (!previewUrl.startsWith('blob:')) {
    return previewUrl
  }

  const file = usePendingImageStore.getState().getFileByPreviewUrl(previewUrl)
  if (!file) {
    throw new Error('Banner image file is missing. Please select the image again.')
  }

  return uploadEditorImage(file, altText)
}

export async function prepareTourSettingsForSubmit(
  values: TourSettingsFormValues,
): Promise<TourSettingsFormValues> {
  const ogImageUrl = await resolveImageUrl(
    values.tour.ogImage.url,
    values.tour.ogImage.alt_text,
  )

  const bannerPhotos = await Promise.all(
    values.bannerPhotos.map(async (photo) => {
      const url = await resolveImageUrl(photo.url, photo.alt_text)
      return {
        ...photo,
        url,
      }
    }),
  )

  return {
    ...values,
    tour: {
      ...values.tour,
      ogImage: {
        ...values.tour.ogImage,
        url: ogImageUrl,
      },
    },
    bannerPhotos: bannerPhotos as TourSettingsFormValues['bannerPhotos'],
  }
}
