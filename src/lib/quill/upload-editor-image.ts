export async function uploadEditorImage(file: File, alt?: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  if (alt?.trim()) {
    formData.append('alt', alt.trim())
  }

  const response = await fetch('/api/images', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  const data = (await response.json().catch(() => ({}))) as {
    error?: string
    image?: { url?: string }
  }

  if (!response.ok || !data.image?.url) {
    throw new Error(data.error ?? 'Image upload failed')
  }

  return data.image.url
}
