import { create } from 'zustand'

export type PendingImageEntry = {
  previewUrl: string
  file: File
  fieldKey?: string
  altText?: string
}

type PendingImageState = {
  entries: PendingImageEntry[]
  addFile: (file: File, fieldKey?: string) => string
  replaceFieldFile: (fieldKey: string, file: File) => string
  getFileByPreviewUrl: (previewUrl: string) => File | undefined
  getFieldEntry: (fieldKey: string) => PendingImageEntry | undefined
  setAltText: (previewUrl: string, altText: string) => void
  removeField: (fieldKey: string) => void
  getUniqueUploadEntries: () => PendingImageEntry[]
  clearAll: () => void
}

function revokePreviewUrl(url: string) {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

export const usePendingImageStore = create<PendingImageState>((set, get) => ({
  entries: [],

  addFile: (file, fieldKey) => {
    const previewUrl = URL.createObjectURL(file)

    set((state) => {
      if (fieldKey) {
        const existing = state.entries.find((entry) => entry.fieldKey === fieldKey)
        if (existing) {
          revokePreviewUrl(existing.previewUrl)
        }
      }

      const nextEntries = fieldKey
        ? [...state.entries.filter((entry) => entry.fieldKey !== fieldKey), { previewUrl, file, fieldKey }]
        : [...state.entries, { previewUrl, file }]

      return { entries: nextEntries }
    })

    return previewUrl
  },

  replaceFieldFile: (fieldKey, file) => {
    return get().addFile(file, fieldKey)
  },

  getFileByPreviewUrl: (previewUrl) => {
    return get().entries.find((entry) => entry.previewUrl === previewUrl)?.file
  },

  getFieldEntry: (fieldKey) => {
    return get().entries.find((entry) => entry.fieldKey === fieldKey)
  },

  setAltText: (previewUrl, altText) => {
    set((state) => ({
      entries: state.entries.map((entry) =>
        entry.previewUrl === previewUrl ? { ...entry, altText } : entry,
      ),
    }))
  },

  removeField: (fieldKey) => {
    set((state) => {
      const existing = state.entries.find((entry) => entry.fieldKey === fieldKey)
      if (existing) {
        revokePreviewUrl(existing.previewUrl)
      }

      return {
        entries: state.entries.filter((entry) => entry.fieldKey !== fieldKey),
      }
    })
  },

  getUniqueUploadEntries: () => {
    const seen = new Set<string>()
    const unique: PendingImageEntry[] = []

    for (const entry of get().entries) {
      const key = `${entry.previewUrl}:${entry.file.name}:${entry.file.size}:${entry.file.lastModified}`
      if (seen.has(key)) continue
      seen.add(key)
      unique.push(entry)
    }

    return unique
  },

  clearAll: () => {
    for (const entry of get().entries) {
      revokePreviewUrl(entry.previewUrl)
    }
    set({ entries: [] })
  },
}))
