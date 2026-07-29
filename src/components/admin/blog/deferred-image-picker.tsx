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
  /**
   * Thumbnail-sized horizontal layout for use inside a grid of many images,
   * where the default full-width preview would make each row a screenful.
   */
  compact?: boolean
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
  compact = false,
}: DeferredImagePickerProps) {
  const altInputId = `${id}_alt`

  const fileInput = (
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
  )

  if (compact) {
    return (
      <div className="flex min-w-0 gap-3">
        <div className="shrink-0">
          {previewUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={previewUrl}
              alt={altText || 'Selected image preview'}
              className="size-20 rounded-xl border border-zinc-200 object-cover"
            />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white text-center text-[10px] text-zinc-400">
              No image
            </div>
          )}
          {fileInput}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor={id}
              className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-heading transition hover:bg-zinc-50"
            >
              {previewUrl ? 'Replace' : 'Choose image'}
            </label>
            {previewUrl ? (
              <button
                type="button"
                onClick={onClear}
                className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
              >
                Clear
              </button>
            ) : null}
          </div>

          {onAltTextChange ? (
            <div>
              <label htmlFor={altInputId} className="sr-only">
                Alt text
              </label>
              <input
                id={altInputId}
                type="text"
                value={altText}
                onChange={(event) => onAltTextChange(event.target.value)}
                placeholder="Alt text"
                className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {altError ? <p className="mt-1 text-xs text-red-600">{altError}</p> : null}
            </div>
          ) : null}

          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
      </div>
    )
  }

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

        {fileInput}

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

      {/* Rendered next to the image, not after the alt-text input, so an image
          error is never mistaken for an alt-text error. */}
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

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
    </div>
  )
}
