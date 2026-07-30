'use client'

import BannerGalleryField from '@/components/admin/tour-config/banner-gallery-field'
import DeferredImagePicker from '@/components/admin/blog/deferred-image-picker'
import { saveAdminAttractionTour } from '@/lib/admin-attraction-tour-api'
import { defaultAltFromFileName } from '@/lib/image-alt'
import { uploadEditorImage } from '@/lib/quill/upload-editor-image'
import type { TourBannerPhotoInput } from '@/lib/tour-config.types'
import {
  attractionTourFormSchema,
  createEmptyAttractionTourValues,
  slugifyTourTitle,
  type AttractionTourFormValues,
} from '@/lib/validations/attraction-tour.validation'
import { usePendingImageStore } from '@/store/pending-image-store'
import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useFieldArray, useForm, type Control, type FieldPath } from 'react-hook-form'
import { FaArrowLeft, FaPlus, FaStar, FaTrash } from 'react-icons/fa6'

// Quill touches `document` on import, so it can only load in the browser.
const QuillEditor = dynamic(() => import('@/components/admin/blog/quill-editor'), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-500">
      Loading editor…
    </div>
  ),
})

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h3 className="text-base font-bold text-heading">{title}</h3>
        {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

/** Stable pending-upload key for this form's social image. */
const OG_IMAGE_FIELD_KEY = 'attraction-tour-og-image'

/**
 * Shown as placeholders so the admin can see which widget a tour falls back to.
 * These are the same env values `site-config.defaults.ts` seeds the site-wide
 * Bokun settings from.
 */
const SITE_BOKUN_CHANNEL = process.env.NEXT_PUBLIC_BOKUN_CHANNEL || 'Site default channel'
const SITE_BOKUN_EXPERIENCE_ID =
  process.env.NEXT_PUBLIC_BOKUN_EXPERIENCE_ID || 'Site default experience'

const inputClass =
  'w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-600">{message}</p>
}

/** Only these two sections get a special bullet marker on the public page. */
function sectionHint(sectionId?: string): string | undefined {
  if (sectionId === 'inclusion') return 'Bullets render with a green check on the page.'
  if (sectionId === 'exclusion') return 'Bullets render with a red cross on the page.'
  return undefined
}

/**
 * A Quill-backed field bound through `Controller` — the editor is uncontrolled
 * internally, so `register` cannot drive it.
 */
function RichTextField({
  control,
  name,
  id,
  label,
  hint,
  placeholder,
  required = false,
  minHeight = 180,
  error,
}: {
  control: Control<AttractionTourFormValues>
  name: FieldPath<AttractionTourFormValues>
  id: string
  label: string
  hint?: string
  placeholder?: string
  required?: boolean
  minHeight?: number
  error?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-heading">
        {label} {required ? <span className="text-primary">*</span> : null}
      </label>
      {hint ? <p className="mb-2 text-xs text-zinc-500">{hint}</p> : null}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <QuillEditor
            id={id}
            value={typeof field.value === 'string' ? field.value : ''}
            onChange={field.onChange}
            placeholder={placeholder}
            minHeight={minHeight}
          />
        )}
      />
      <FieldError message={error} />
    </div>
  )
}

/** Editor for a plain `string[]` field (highlights, tags, quotes, options). */
function StringListField({
  label,
  hint,
  values,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string
  hint?: string
  values: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  multiline?: boolean
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div>
          <span className="block text-sm font-medium text-heading">{label}</span>
          {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
        </div>
        <button
          type="button"
          onClick={() => onChange([...values, ''])}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-semibold text-heading transition hover:bg-zinc-50"
        >
          <FaPlus className="size-3" aria-hidden="true" /> Add
        </button>
      </div>

      <div className="space-y-2">
        {values.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-200 px-3 py-4 text-center text-xs text-zinc-400">
            Nothing added yet.
          </p>
        ) : null}

        {values.map((value, index) => (
          <div key={index} className="flex items-start gap-2">
            {multiline ? (
              <textarea
                rows={2}
                value={value}
                placeholder={placeholder}
                onChange={(event) => {
                  const next = [...values]
                  next[index] = event.target.value
                  onChange(next)
                }}
                className={inputClass}
              />
            ) : (
              <input
                value={value}
                placeholder={placeholder}
                onChange={(event) => {
                  const next = [...values]
                  next[index] = event.target.value
                  onChange(next)
                }}
                className={inputClass}
              />
            )}
            <button
              type="button"
              aria-label={`Remove ${label} ${index + 1}`}
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="mt-1 rounded-lg p-2 text-red-600 transition hover:bg-red-50"
            >
              <FaTrash className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

type AttractionTourFormProps = {
  mode: 'create' | 'update'
  tourId: string
  initialValues?: AttractionTourFormValues
}

export default function AttractionTourForm({
  mode,
  tourId,
  initialValues,
}: AttractionTourFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [slugEdited, setSlugEdited] = useState(mode === 'update')

  const replaceFieldFile = usePendingImageStore((state) => state.replaceFieldFile)
  const removePendingField = usePendingImageStore((state) => state.removeField)
  const setPendingAltText = usePendingImageStore((state) => state.setAltText)
  const clearAllPending = usePendingImageStore((state) => state.clearAll)

  const form = useForm<AttractionTourFormValues>({
    resolver: zodResolver(attractionTourFormSchema),
    defaultValues: initialValues ?? createEmptyAttractionTourValues(),
    mode: 'onBlur',
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = form

  const galleryArray = useFieldArray({ control, name: 'gallery' })
  const reviewsArray = useFieldArray({ control, name: 'reviews' })
  const importantArray = useFieldArray({ control, name: 'importantInformation' })

  const gallery = watch('gallery')
  const reviews = watch('reviews')
  const importantInformation = watch('importantInformation')

  // Falling back to the site-wide widget silently books a DIFFERENT experience,
  // so the admin has to be told rather than left to discover it from a booking.
  const usesSiteWideBokun = !watch('bokun.channel') && !watch('bokun.experienceId')

  async function onSubmit(values: AttractionTourFormValues) {
    setIsSaving(true)
    setSubmitError(null)
    setSaveMessage(null)

    try {
      // Upload any queued files, then swap the blob previews for real URLs —
      // the server schema rejects leftover `blob:` links.
      const gallery = await Promise.all(
        values.gallery.map(async (photo) => {
          if (!photo.url.startsWith('blob:')) return photo
          const file = usePendingImageStore
            .getState()
            .getFileByPreviewUrl(photo.url)
          if (!file) throw new Error(`Image "${photo.label}" is missing. Select it again.`)
          return { ...photo, url: await uploadEditorImage(file, photo.alt) }
        }),
      )

      const ogImageUrl = values.seo.ogImage.url.startsWith('blob:')
        ? await (async () => {
            const file = usePendingImageStore
              .getState()
              .getFileByPreviewUrl(values.seo.ogImage.url)
            if (!file) throw new Error('Social image is missing. Select it again.')
            return uploadEditorImage(file, values.seo.ogImage.alt)
          })()
        : values.seo.ogImage.url

      const prepared = {
        ...values,
        gallery,
        seo: { ...values.seo, ogImage: { ...values.seo.ogImage, url: ogImageUrl } },
      }
      const saved = await saveAdminAttractionTour(mode, tourId, prepared)
      clearAllPending()

      setSaveMessage('Tour saved successfully.')

      if (mode === 'create') {
        router.push(`/admin/attraction-tours/${saved.id}`)
        router.refresh()
        return
      }

      reset(saved.form)
      router.refresh()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save tour')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-4xl space-y-6 pb-16"
      noValidate
    >
      <div className="sticky top-0 z-20 -mx-4 border-b border-zinc-200 bg-zinc-50/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Link
              href="/admin/attraction-tours"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-primary"
            >
              <FaArrowLeft className="size-3" aria-hidden="true" /> All tours
            </Link>
            <h1 className="mt-1 truncate text-xl font-bold text-heading">
              {mode === 'create' ? 'New attraction tour' : 'Edit attraction tour'}
            </h1>
          </div>

          <button
            type="submit"
            disabled={isSaving || (mode === 'update' && !isDirty)}
            title={mode === 'update' && !isDirty && !isSaving ? 'No changes to save' : undefined}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-heading px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-heading/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : mode === 'create' ? 'Create tour' : 'Update tour'}
          </button>
        </div>
      </div>

      {submitError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}
      {saveMessage ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {saveMessage}
        </p>
      ) : null}

      <SectionCard title="Basics" description="Title, URL and publish state.">
        <div className="space-y-4">
          <div>
            <label htmlFor="tour_title" className="mb-1.5 block text-sm font-medium text-heading">
              Title <span className="text-primary">*</span>
            </label>
            <input
              id="tour_title"
              className={inputClass}
              {...register('title', {
                onChange: (event) => {
                  if (slugEdited) return
                  setValue('slug', slugifyTourTitle(event.target.value), {
                    shouldDirty: true,
                  })
                },
              })}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div>
            <label htmlFor="tour_slug" className="mb-1.5 block text-sm font-medium text-heading">
              Slug <span className="text-primary">*</span>
            </label>
            <input
              id="tour_slug"
              className={inputClass}
              {...register('slug', { onChange: () => setSlugEdited(true) })}
            />
            <p className="mt-1 text-xs text-zinc-500">/attraction-tours/{watch('slug') || '…'}</p>
            <FieldError message={errors.slug?.message} />
          </div>

          <label className="inline-flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3">
            <input type="checkbox" className="size-4" {...register('isPublished')} />
            <span className="text-sm font-medium text-heading">Published (visible on the site)</span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="rating_avg" className="mb-1.5 block text-sm font-medium text-heading">
                Rating (0–5)
              </label>
              <input
                id="rating_avg"
                type="number"
                step="0.1"
                className={inputClass}
                {...register('rating.average', { valueAsNumber: true })}
              />
              <FieldError message={errors.rating?.average?.message} />
            </div>
            <div>
              <label htmlFor="rating_count" className="mb-1.5 block text-sm font-medium text-heading">
                Review count
              </label>
              <input
                id="rating_count"
                type="number"
                className={inputClass}
                {...register('rating.reviewCount', { valueAsNumber: true })}
              />
              <FieldError message={errors.rating?.reviewCount?.message} />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Gallery"
        description="Hero collage and full-screen gallery. The feature image is shown large."
      >
        <BannerGalleryField
          items={gallery as unknown as TourBannerPhotoInput[]}
          errors={errors.gallery as never}
          rootError={errors.gallery?.root?.message ?? errors.gallery?.message}
          onAddFiles={(files) => {
            files.forEach((file) => {
              const id = crypto.randomUUID()
              const previewUrl = replaceFieldFile(`tour-gallery-${id}`, file)
              const alt = defaultAltFromFileName(file.name)
              galleryArray.append({
                id,
                url: previewUrl,
                alt,
                label: alt,
                featured: getValues('gallery').length === 0,
              })
              setPendingAltText(previewUrl, alt)
            })
          }}
          onLabelChange={(index, label) =>
            setValue(`gallery.${index}.label`, label, { shouldDirty: true })
          }
          onAltTextChange={(index, value) => {
            setValue(`gallery.${index}.alt`, value, { shouldDirty: true })
            const url = gallery[index]?.url
            if (url?.startsWith('blob:')) setPendingAltText(url, value)
          }}
          onSelectFile={(index, file) => {
            const photo = gallery[index]
            if (!photo) return
            const previewUrl = replaceFieldFile(`tour-gallery-${photo.id}`, file)
            setValue(`gallery.${index}.url`, previewUrl, { shouldDirty: true })
            setValue(`gallery.${index}.alt`, defaultAltFromFileName(file.name), {
              shouldDirty: true,
            })
          }}
          onClearImage={(index) => {
            const photo = gallery[index]
            if (!photo) return
            removePendingField(`tour-gallery-${photo.id}`)
            setValue(`gallery.${index}.url`, '', { shouldDirty: true })
          }}
          onRemove={(index) => {
            const photo = gallery[index]
            if (photo) removePendingField(`tour-gallery-${photo.id}`)
            const wasFeatured = photo?.featured
            galleryArray.remove(index)
            if (wasFeatured && getValues('gallery').length > 0) {
              setValue('gallery.0.featured', true, { shouldDirty: true })
            }
          }}
          onReorder={(from, to) => {
            if (to < 0 || to >= gallery.length) return
            galleryArray.move(from, to)
          }}
          onSetFeatured={(index) => {
            gallery.forEach((_, i) => {
              setValue(`gallery.${i}.featured`, i === index, { shouldDirty: true })
            })
          }}
        />
      </SectionCard>

      <SectionCard title="Booking panel" description="Price box shown beside the gallery.">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="price_from" className="mb-1.5 block text-sm font-medium text-heading">
                Price <span className="text-primary">*</span>
              </label>
              <input id="price_from" placeholder="€57" className={inputClass} {...register('bookingPanel.priceFrom')} />
              <FieldError message={errors.bookingPanel?.priceFrom?.message} />
            </div>
            <div>
              <label htmlFor="price_note" className="mb-1.5 block text-sm font-medium text-heading">
                Price note
              </label>
              <input id="price_note" className={inputClass} {...register('bookingPanel.priceNote')} />
            </div>
          </div>

          <div>
            <label htmlFor="primary_cta" className="mb-1.5 block text-sm font-medium text-heading">
              Button label
            </label>
            <input id="primary_cta" className={inputClass} {...register('bookingPanel.primaryCta')} />
            <FieldError message={errors.bookingPanel?.primaryCta?.message} />
          </div>

          <StringListField
            label="Reassurance bullets"
            hint="e.g. Reserve now & pay later"
            values={watch('bookingPanel.secondaryOptions')}
            onChange={(next) =>
              setValue('bookingPanel.secondaryOptions', next, { shouldDirty: true })
            }
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Bokun booking widget"
        description="Which Bokun experience this tour books."
      >
        {usesSiteWideBokun ? (
          <div
            role="status"
            className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            <p className="font-semibold">
              This tour has no Bokun experience — visitors will book the wrong tour.
            </p>
            <p className="mt-1 text-amber-800">
              With both fields blank the booking form falls back to the site-wide widget from{' '}
              <Link href="/admin/site-config" className="underline underline-offset-2">
                Site config
              </Link>{' '}
              (experience <span className="font-mono">{SITE_BOKUN_EXPERIENCE_ID}</span>), which is
              the home page package. Someone booking from this page would reserve that experience
              instead of this one. Add this tour&apos;s own Experience ID below.
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bokun_channel" className="mb-1.5 block text-sm font-medium text-heading">
              Booking channel UUID
            </label>
            <input
              id="bokun_channel"
              className={inputClass}
              placeholder={SITE_BOKUN_CHANNEL}
              {...register('bokun.channel')}
            />
            <FieldError message={errors.bokun?.channel?.message} />
          </div>
          <div>
            <label
              htmlFor="bokun_experience"
              className="mb-1.5 block text-sm font-medium text-heading"
            >
              Experience ID
            </label>
            <input
              id="bokun_experience"
              className={inputClass}
              placeholder={SITE_BOKUN_EXPERIENCE_ID}
              {...register('bokun.experienceId')}
            />
            <FieldError message={errors.bokun?.experienceId?.message} />
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Placeholders show the current site-wide values. Set both fields together — a channel
          without an experience ID produces a calendar that never loads.
        </p>
      </SectionCard>

      <SectionCard title="Overview" description="Main description and highlight bullets.">
        <div className="space-y-5">
          <RichTextField
            control={control}
            name="overview.description"
            id="overview_desc"
            label="Description"
            required
            placeholder="Describe the experience…"
            minHeight={220}
            error={errors.overview?.description?.message}
          />

          <RichTextField
            control={control}
            name="overview.highlightsHtml"
            id="overview_highlights"
            label="Highlights"
            hint="Use the bulleted-list button — each bullet renders with a green check on the page."
            placeholder="Add one highlight per bullet…"
            error={errors.overview?.highlightsHtml?.message}
          />
        </div>
      </SectionCard>

      <SectionCard title="Why travelers loved this" description="Tags and pull quotes.">
        <div className="space-y-5">
          <StringListField
            label="Tags"
            values={watch('whyTravelersLoved.tags')}
            onChange={(next) => setValue('whyTravelersLoved.tags', next, { shouldDirty: true })}
          />
          <StringListField
            label="Quotes"
            multiline
            values={watch('whyTravelersLoved.quotes')}
            onChange={(next) => setValue('whyTravelersLoved.quotes', next, { shouldDirty: true })}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Important information"
        description="Inclusion, exclusion and know-before-you-go sections."
      >
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => importantArray.append({ id: crypto.randomUUID(), title: '', html: '' })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-zinc-50"
          >
            <FaPlus className="size-3" aria-hidden="true" /> Add section
          </button>
        </div>

        <div className="space-y-4">
          {importantArray.fields.map((field, index) => (
            <div key={field.id} className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
              <div className="mb-3 flex items-center gap-2">
                <input
                  placeholder="Section title"
                  className={inputClass}
                  {...register(`importantInformation.${index}.title`)}
                />
                <button
                  type="button"
                  aria-label={`Remove section ${index + 1}`}
                  onClick={() => importantArray.remove(index)}
                  className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                >
                  <FaTrash className="size-3.5" aria-hidden="true" />
                </button>
              </div>
              <RichTextField
                control={control}
                name={`importantInformation.${index}.html`}
                id={`important_${field.id}`}
                label="Content"
                hint={sectionHint(importantInformation[index]?.id)}
                placeholder="Add the details for this section…"
                error={errors.importantInformation?.[index]?.html?.message}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Meeting point & questions">
        <div className="space-y-4">
          <RichTextField
            control={control}
            name="meetingPointAddress"
            id="meeting_point"
            label="Meeting point address"
            placeholder="Street, city, and any arrival notes…"
            minHeight={140}
            error={errors.meetingPointAddress?.message}
          />
          <div>
            <label htmlFor="questions_desc" className="mb-1.5 block text-sm font-medium text-heading">
              Questions section text
            </label>
            <textarea id="questions_desc" rows={2} className={inputClass} {...register('questionsSection.description')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="q_cta_label" className="mb-1.5 block text-sm font-medium text-heading">
                CTA label
              </label>
              <input id="q_cta_label" className={inputClass} {...register('questionsSection.ctaLabel')} />
            </div>
            <div>
              <label htmlFor="q_cta_href" className="mb-1.5 block text-sm font-medium text-heading">
                CTA link
              </label>
              <input id="q_cta_href" className={inputClass} {...register('questionsSection.ctaHref')} />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="SEO & social"
        description="Search and share preview for this tour. Every field is optional — blanks fall back to the tour title, overview and feature image."
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="meta_title" className="mb-1.5 block text-sm font-medium text-heading">
              Meta title
            </label>
            <input
              id="meta_title"
              className={inputClass}
              placeholder={watch('title') || 'Falls back to the tour title'}
              {...register('seo.metaTitle')}
            />
            <FieldError message={errors.seo?.metaTitle?.message} />
          </div>

          <div>
            <label
              htmlFor="meta_description"
              className="mb-1.5 block text-sm font-medium text-heading"
            >
              Meta description
            </label>
            <textarea
              id="meta_description"
              rows={3}
              className={inputClass}
              placeholder="Falls back to the first ~160 characters of the overview"
              {...register('seo.metaDescription')}
            />
            <FieldError message={errors.seo?.metaDescription?.message} />
          </div>

          <StringListField
            label="Meta keywords"
            hint="Used in the page metadata"
            values={watch('seo.metaKeywords')}
            onChange={(next) => setValue('seo.metaKeywords', next, { shouldDirty: true })}
          />

          <Controller
            control={control}
            name="seo.ogImage.url"
            render={({ field }) => (
              <DeferredImagePicker
                id="tour_og_image"
                label="Social share image"
                hint="Shown when the tour is shared on Facebook, WhatsApp or X. 1200×630 recommended. Falls back to the gallery feature image."
                previewUrl={field.value || undefined}
                altText={watch('seo.ogImage.alt')}
                altError={errors.seo?.ogImage?.alt?.message}
                error={errors.seo?.ogImage?.url?.message}
                onAltTextChange={(value) => {
                  setValue('seo.ogImage.alt', value, { shouldDirty: true })
                  if (field.value.startsWith('blob:')) {
                    setPendingAltText(field.value, value)
                  }
                }}
                onSelect={(file) => {
                  field.onChange(replaceFieldFile(OG_IMAGE_FIELD_KEY, file))
                  setValue('seo.ogImage.alt', defaultAltFromFileName(file.name), {
                    shouldDirty: true,
                  })
                }}
                onClear={() => {
                  removePendingField(OG_IMAGE_FIELD_KEY)
                  field.onChange('')
                  setValue('seo.ogImage.alt', '', { shouldDirty: true })
                }}
              />
            )}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Reviews"
        description="Traveler reviews shown in the reviews slider on the tour page."
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm text-zinc-500">
            {reviews.length} review{reviews.length === 1 ? '' : 's'}
          </p>
          <button
            type="button"
            onClick={() =>
              reviewsArray.append({
                id: crypto.randomUUID(),
                reviewer: '',
                date: '',
                rating: 5,
                text: '',
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-zinc-50"
          >
            <FaPlus className="size-3" aria-hidden="true" /> Add review
          </button>
        </div>

        <div className="space-y-4">
          {reviewsArray.fields.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-400">
              No reviews yet — add the first one.
            </p>
          ) : null}

          {reviewsArray.fields.map((field, index) => (
            <div key={field.id} className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-heading">
                  <FaStar className="size-3 text-primary" aria-hidden="true" />
                  Review {index + 1}
                </span>
                <button
                  type="button"
                  aria-label={`Remove review ${index + 1}`}
                  onClick={() => reviewsArray.remove(index)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <FaTrash className="size-3" aria-hidden="true" /> Remove
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-heading">Reviewer</label>
                  <input
                    placeholder="Victoria_E"
                    className={inputClass}
                    {...register(`reviews.${index}.reviewer`)}
                  />
                  <FieldError message={errors.reviews?.[index]?.reviewer?.message} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-heading">Date</label>
                  <input
                    placeholder="Jul 2026"
                    className={inputClass}
                    {...register(`reviews.${index}.date`)}
                  />
                  <FieldError message={errors.reviews?.[index]?.date?.message} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-heading">Rating (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step="1"
                    className={inputClass}
                    {...register(`reviews.${index}.rating`, { valueAsNumber: true })}
                  />
                  <FieldError message={errors.reviews?.[index]?.rating?.message} />
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-1.5 block text-xs font-medium text-heading">Review text</label>
                <textarea rows={3} className={inputClass} {...register(`reviews.${index}.text`)} />
                <FieldError message={errors.reviews?.[index]?.text?.message} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </form>
  )
}
