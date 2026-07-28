'use client'

import {
  defaultCustomSelect,
  registerQuillModules,
  TableAlign,
  TableMenuContextmenu,
  TableResizeScale,
  TableSelection,
  TableUp,
} from '@/lib/quill/register-quill-modules'
import { defaultAltFromFileName } from '@/lib/image-alt'
import {
  applyQuillImageSettings,
  DEFAULT_QUILL_IMAGE_WIDTH,
  readImageDimension,
  type QuillImageSettings,
} from '@/lib/quill/quill-image-settings'
import { uploadEditorImage } from '@/lib/quill/upload-editor-image'
import { useModalBehavior } from '@/hooks/use-modal-behavior'
import { useEffect, useRef, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

type QuillEditorProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
  minHeight?: number
}

type PendingImageInsert = {
  file: File
  defaultAlt: string
  index: number
}

type ImageDialogMode = 'insert' | 'edit'

function bindDeferredImageHandler(
  quill: Quill,
  onImageSelected: (payload: PendingImageInsert) => void,
) {
  const toolbar = quill.getModule('toolbar') as { addHandler?: (name: string, handler: () => void) => void } | undefined

  toolbar?.addHandler?.('image', () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp,image/gif,image/avif'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return

      const range = quill.getSelection(true)
      const index = range?.index ?? quill.getLength()

      onImageSelected({
        file,
        defaultAlt: defaultAltFromFileName(file.name),
        index,
      })
    }
    input.click()
  })
}

function findImageBySrc(root: HTMLElement, src: string) {
  return root.querySelector(`img[src="${CSS.escape(src)}"]`) as HTMLImageElement | null
}

function insertImageWithSettings(
  quill: Quill,
  index: number,
  previewUrl: string,
  settings: QuillImageSettings,
) {
  quill.setSelection(index, 0, Quill.sources.SILENT)
  quill.insertEmbed(index, 'image', previewUrl, Quill.sources.USER)

  const img = findImageBySrc(quill.root, previewUrl)
  if (img) {
    applyQuillImageSettings(img, settings)
  }

  quill.setSelection(index + 1, Quill.sources.SILENT)
}

function emitEditorHtml(editor: Quill, onChange: (value: string) => void, emittedHtmlRef: { current: string }) {
  const html = editor.root.innerHTML
  emittedHtmlRef.current = html
  onChange(html)
}

function ImageSettingsDialog({
  mode,
  altText,
  width,
  height,
  onAltTextChange,
  onWidthChange,
  onHeightChange,
  onCancel,
  onConfirm,
  isSubmitting = false,
  errorMessage,
}: {
  mode: ImageDialogMode
  altText: string
  width: string
  height: string
  onAltTextChange: (value: string) => void
  onWidthChange: (value: string) => void
  onHeightChange: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
  isSubmitting?: boolean
  errorMessage?: string | null
}) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Escape to cancel, focus trap, focus restore and scroll lock — previously
  // Tab escaped straight into the blog form behind the overlay.
  useModalBehavior({ open: true, containerRef: dialogRef, onClose: onCancel })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quill-image-settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h4 id="quill-image-settings-title" className="text-base font-bold text-heading">
          {mode === 'insert' ? 'Insert image' : 'Image settings'}
        </h4>
        <p className="mt-1 text-sm text-zinc-500">
          Set alt text and optional width / height. Leave size empty to use automatic sizing.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="quill-image-alt" className="mb-1.5 block text-sm font-medium text-heading">
              Alt text
            </label>
            <input
              id="quill-image-alt"
              type="text"
              value={altText}
              onChange={(event) => onAltTextChange(event.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Describe the image"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="quill-image-width" className="mb-1.5 block text-sm font-medium text-heading">
                Width
              </label>
              <input
                id="quill-image-width"
                type="text"
                value={width}
                onChange={(event) => onWidthChange(event.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="400 or 50%"
              />
            </div>
            <div>
              <label htmlFor="quill-image-height" className="mb-1.5 block text-sm font-medium text-heading">
                Height
              </label>
              <input
                id="quill-image-height"
                type="text"
                value={height}
                onChange={(event) => onHeightChange(event.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Auto"
              />
            </div>
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-heading transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? 'Uploading…'
              : mode === 'insert'
                ? 'Insert image'
                : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function QuillEditor({
  value,
  onChange,
  placeholder,
  id,
  minHeight = 220,
}: QuillEditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<Quill | null>(null)
  const onChangeRef = useRef(onChange)
  const valueRef = useRef(value)
  const emittedHtmlRef = useRef(value)
  const editingImageRef = useRef<HTMLImageElement | null>(null)
  const [dialogMode, setDialogMode] = useState<ImageDialogMode | null>(null)
  const [pendingInsert, setPendingInsert] = useState<PendingImageInsert | null>(null)
  const [altText, setAltText] = useState('')
  const [imageWidth, setImageWidth] = useState(DEFAULT_QUILL_IMAGE_WIDTH)
  const [imageHeight, setImageHeight] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageDialogError, setImageDialogError] = useState<string | null>(null)

  useEffect(() => {
    onChangeRef.current = onChange
    valueRef.current = value
  })

  function resetDialogState() {
    setDialogMode(null)
    setPendingInsert(null)
    editingImageRef.current = null
    setAltText('')
    setImageWidth(DEFAULT_QUILL_IMAGE_WIDTH)
    setImageHeight('')
    setIsUploadingImage(false)
    setImageDialogError(null)
  }

  function currentImageSettings(defaultAlt: string): QuillImageSettings {
    return {
      alt: altText.trim() || defaultAlt,
      width: imageWidth,
      height: imageHeight,
    }
  }

  useEffect(() => {
    registerQuillModules()

    const wrapper = wrapperRef.current
    if (!wrapper || quillRef.current) return

    wrapper.innerHTML = ''
    const container = document.createElement('div')
    if (id) container.id = id
    wrapper.appendChild(container)

    const editor = new Quill(container, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: {
          container: [
            [{ header: [2, 3, false] }],
            [{ align: [] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'blockquote', 'image'],
            [{ [TableUp.toolName]: [] }],
            ['clean'],
          ],
        },
        [TableUp.moduleName]: {
          customSelect: defaultCustomSelect,
          modules: [
            { module: TableSelection },
            { module: TableMenuContextmenu },
            { module: TableResizeScale },
            { module: TableAlign },
          ],
        },
      },
    })

    bindDeferredImageHandler(editor, (payload) => {
      setAltText(payload.defaultAlt)
      setImageWidth(DEFAULT_QUILL_IMAGE_WIDTH)
      setImageHeight('')
      setPendingInsert(payload)
      setDialogMode('insert')
    })

    function handleImageClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof HTMLImageElement)) return
      if (!editor.root.contains(target)) return

      event.preventDefault()

      editor.root.querySelectorAll('img.quill-image-selected').forEach((node) => {
        node.classList.remove('quill-image-selected')
      })
      target.classList.add('quill-image-selected')

      editingImageRef.current = target
      setAltText(target.getAttribute('alt') ?? '')
      setImageWidth(readImageDimension(target, 'width'))
      setImageHeight(readImageDimension(target, 'height'))
      setPendingInsert(null)
      setDialogMode('edit')
    }

    editor.root.addEventListener('click', handleImageClick)
    editor.root.innerHTML = valueRef.current
    emittedHtmlRef.current = valueRef.current
    editor.on('text-change', () => {
      emitEditorHtml(editor, onChangeRef.current, emittedHtmlRef)
    })

    quillRef.current = editor

    return () => {
      editor.root.removeEventListener('click', handleImageClick)
      // Detach Quill's own handlers too — wiping innerHTML alone left the
      // `text-change` listener (and TableUp's document listeners) alive, so
      // every remount leaked another editor instance.
      editor.off('text-change')
      quillRef.current = null
      wrapper.innerHTML = ''
    }
  }, [id, placeholder])

  useEffect(() => {
    const editor = quillRef.current
    if (!editor) return

    if (value === emittedHtmlRef.current) return

    const current = editor.root.innerHTML
    if (value === current) {
      emittedHtmlRef.current = value
      return
    }

    editor.root.innerHTML = value
    emittedHtmlRef.current = value
  }, [value])

  async function confirmImageInsert() {
    const editor = quillRef.current
    if (!editor || !pendingInsert) return

    const settings = currentImageSettings(pendingInsert.defaultAlt)

    setIsUploadingImage(true)
    setImageDialogError(null)

    try {
      const remoteUrl = await uploadEditorImage(pendingInsert.file, settings.alt)
      insertImageWithSettings(editor, pendingInsert.index, remoteUrl, settings)
      emitEditorHtml(editor, onChangeRef.current, emittedHtmlRef)
      resetDialogState()
    } catch (error) {
      setImageDialogError(error instanceof Error ? error.message : 'Image upload failed')
    } finally {
      setIsUploadingImage(false)
    }
  }

  function confirmImageEdit() {
    const editor = quillRef.current
    const img = editingImageRef.current
    if (!editor || !img) return

    applyQuillImageSettings(img, currentImageSettings(img.getAttribute('alt') ?? ''))
    emitEditorHtml(editor, onChangeRef.current, emittedHtmlRef)
    img.classList.remove('quill-image-selected')
    resetDialogState()
  }

  function handleDialogConfirm() {
    if (dialogMode === 'insert') {
      confirmImageInsert()
      return
    }

    if (dialogMode === 'edit') {
      confirmImageEdit()
    }
  }

  return (
    <>
      <div
        className="blog-quill overflow-hidden rounded-xl border border-zinc-200 bg-white"
        style={{ ['--quill-min-height' as string]: `${minHeight}px` }}
      >
        <div ref={wrapperRef} />
      </div>

      {dialogMode ? (
        <ImageSettingsDialog
          mode={dialogMode}
          altText={altText}
          width={imageWidth}
          height={imageHeight}
          onAltTextChange={setAltText}
          onWidthChange={setImageWidth}
          onHeightChange={setImageHeight}
          onCancel={resetDialogState}
          onConfirm={handleDialogConfirm}
          isSubmitting={isUploadingImage}
          errorMessage={imageDialogError}
        />
      ) : null}
    </>
  )
}
