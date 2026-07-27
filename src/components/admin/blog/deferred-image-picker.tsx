'use client'

type DeferredImagePickerProps = {
  id: string
  label: string
  hint?: string
  previewUrl?: string
  altText?: string
  onAltTextChange?: (value: string) => void
  altError?: string
  onSelect: (file: File) => void
  onClear: () => void
  error?: string
}

export default function DeferredImagePicker({
  id,
  label,
  hint,
  previewUrl,
  altText = '',
  onAltTextChange,
  altError,
  onSelect,
  onClear,
  error,
}: DeferredImagePickerProps) {
  const altInputId = `${id}_alt`

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-heading">
        {label}
      </label>
      {hint ? <p className="mb-3 text-xs text-zinc-500">{hint}</p> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <label
          htmlFor={id}
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-heading transition hover:bg-zinc-50"
        >
          Choose image
        </label>

        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            onSelect(file)
            event.target.value = ''
          }}
        />

        {previewUrl ? (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium text-red-600 transition hover:text-red-700"
          >
            Remove image
          </button>
        ) : null}
      </div>

      {previewUrl ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={altText || 'Selected image preview'}
            className="min-w-[400px] max-w-full rounded-xl object-cover"
          />
          <p className="mt-2 text-xs text-zinc-500">
            Preview only — image uploads when you submit the form.
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-500">
          No image selected yet.
        </div>
      )}

      {previewUrl && onAltTextChange ? (
        <div className="mt-4">
          <label htmlFor={altInputId} className="mb-1.5 block text-sm font-medium text-heading">
            Alt text
          </label>
          <input
            id={altInputId}
            type="text"
            value={altText}
            onChange={(event) => onAltTextChange(event.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Describe the image for accessibility"
          />
          {altError ? <p className="mt-1 text-xs text-red-600">{altError}</p> : null}
        </div>
      ) : null}

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
