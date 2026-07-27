'use client'

import DeferredImagePicker from '@/components/admin/blog/deferred-image-picker'
import {
  TOUR_BANNER_FEATURED_SPEC,
  TOUR_BANNER_GALLERY_DESCRIPTION,
  TOUR_BANNER_TILE_SPEC,
  TOUR_OG_IMAGE_SPEC,
} from '@/lib/tour-image-specs'
import { saveTourSettingsForm } from '@/lib/admin-tour-settings-api'
import { defaultAltFromFileName } from '@/lib/image-alt'
import { prepareTourSettingsForSubmit, TOUR_BANNER_FIELD_KEYS } from '@/lib/tour-settings/prepare-tour-settings-submit'
import {
  createEmptyTourSettingsValues,
  slugifyTourId,
  tourSettingsSchema,
  type TourSettingsFormValues,
} from '@/lib/validations/tour-settings.validation'
import { usePendingImageStore } from '@/store/pending-image-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { FaPlus, FaTrash } from 'react-icons/fa6'

const OG_IMAGE_FIELD_KEY = 'tour-settings-og-image'

function fieldClass(hasError?: boolean) {
  return [
    'w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition',
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
      : 'border-zinc-200 focus:border-primary focus:ring-2 focus:ring-primary/20',
  ].join(' ')
}

function FieldLabel({
  htmlFor,
  label,
  hint,
  required,
}: {
  htmlFor?: string
  label: string
  hint?: string
  required?: boolean
}) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-heading">
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </label>
      {hint ? <p className="mt-0.5 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-600">{message}</p>
}

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

function TextInput({
  id,
  label,
  hint,
  required,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  required?: boolean
  error?: string
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} label={label} hint={hint} required={required} />
      <input id={id} className={fieldClass(Boolean(error))} {...props} />
      <FieldError message={error} />
    </div>
  )
}

function TextArea({
  id,
  label,
  hint,
  required,
  error,
  rows = 4,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  hint?: string
  required?: boolean
  error?: string
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} label={label} hint={hint} required={required} />
      <textarea id={id} rows={rows} className={fieldClass(Boolean(error))} {...props} />
      <FieldError message={error} />
    </div>
  )
}

type TourSettingsFormProps = {
  initialValues: TourSettingsFormValues
}

export default function TourSettingsForm({ initialValues }: TourSettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const replaceFieldFile = usePendingImageStore((state) => state.replaceFieldFile)
  const removePendingField = usePendingImageStore((state) => state.removeField)
  const setPendingAltText = usePendingImageStore((state) => state.setAltText)
  const clearAllPending = usePendingImageStore((state) => state.clearAll)

  const form = useForm<TourSettingsFormValues>({
    resolver: zodResolver(tourSettingsSchema),
    defaultValues: initialValues,
    mode: 'onBlur',
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form

  const faqsArray = useFieldArray({ control, name: 'faqs' })
  const importantInfoArray = useFieldArray({ control, name: 'importantInfo' })

  const keywords = watch('tour.keywords')
  const ogImageUrl = watch('tour.ogImage.url')
  const ogImageAlt = watch('tour.ogImage.alt_text')
  const importantInfo = watch('importantInfo')

  async function onSubmit(values: TourSettingsFormValues) {
    setIsSaving(true)
    setSubmitError(null)
    setSaveMessage(null)

    try {
      const prepared = await prepareTourSettingsForSubmit(values)
      await saveTourSettingsForm(prepared)
      clearAllPending()
      form.reset(prepared)
      setSaveMessage('Tour settings saved successfully.')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save tour settings')
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
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-heading">Tour configuration</h1>
        <p className="text-sm text-zinc-500">
          Manage Louvre tour copy, pricing labels, FAQs, and important visitor information. Empty
          saved fields fall back to built-in defaults.
        </p>
      </header>

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

      <SectionCard title="Tour copy" description="Main product name, page title, and descriptions.">
        <div className="space-y-5">
          <TextInput
            id="tour_name"
            label="Tour name"
            required
            error={errors.tour?.name?.message}
            {...register('tour.name')}
          />
          <TextInput
            id="tour_title"
            label="Page title"
            required
            error={errors.tour?.title?.message}
            {...register('tour.title')}
          />
          <TextArea
            id="tour_description"
            label="Description"
            required
            error={errors.tour?.description?.message}
            {...register('tour.description')}
          />
          <TextArea
            id="tour_short_description"
            label="Short description"
            hint="Used in footer, schema markup, and cards"
            required
            error={errors.tour?.shortDescription?.message}
            {...register('tour.shortDescription')}
          />
          <div className="grid gap-5 sm:grid-cols-3">
            <TextInput
              id="tour_brand"
              label="Brand label"
              required
              error={errors.tour?.brand?.message}
              {...register('tour.brand')}
            />
            <TextInput
              id="tour_slug"
              label="Slug"
              required
              error={errors.tour?.slug?.message}
              {...register('tour.slug')}
            />
            <TextInput
              id="tour_href"
              label="Href"
              required
              error={errors.tour?.href?.message}
              {...register('tour.href')}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Pricing & reviews" description="Displayed price labels and review stats.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <TextInput
            id="tour_price"
            label="Schema price"
            type="number"
            step="0.01"
            required
            error={errors.tour?.price?.message}
            {...register('tour.price', { valueAsNumber: true })}
          />
          <TextInput
            id="tour_price_label"
            label="Display price label"
            hint='e.g. "€57"'
            required
            error={errors.tour?.priceLabel?.message}
            {...register('tour.priceLabel')}
          />
          <div>
            <FieldLabel htmlFor="tour_price_currency" label="Currency" required />
            <select
              id="tour_price_currency"
              className={fieldClass(Boolean(errors.tour?.priceCurrency))}
              {...register('tour.priceCurrency')}
            >
              <option value="EUR">EUR</option>
            </select>
            <FieldError message={errors.tour?.priceCurrency?.message} />
          </div>
          <TextInput
            id="tour_rating"
            label="Rating"
            type="number"
            step="0.1"
            required
            error={errors.tour?.rating?.message}
            {...register('tour.rating', { valueAsNumber: true })}
          />
          <TextInput
            id="tour_review_count"
            label="Review count"
            type="number"
            required
            error={errors.tour?.reviewCount?.message}
            {...register('tour.reviewCount', { valueAsNumber: true })}
          />
          <TextInput
            id="tour_review_count_label"
            label="Review count label"
            hint='e.g. "9,594"'
            required
            error={errors.tour?.reviewCountLabel?.message}
            {...register('tour.reviewCountLabel')}
          />
        </div>
      </SectionCard>

      <SectionCard title="Visit details" description="Duration, destination, and meeting point.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput
            id="tour_duration"
            label="Duration code"
            hint='Schema.org duration, e.g. "PT3H"'
            required
            error={errors.tour?.duration?.message}
            {...register('tour.duration')}
          />
          <TextInput
            id="tour_duration_label"
            label="Duration label"
            required
            error={errors.tour?.durationLabel?.message}
            {...register('tour.durationLabel')}
          />
          <TextInput
            id="tour_destination"
            label="Destination"
            required
            error={errors.tour?.destination?.message}
            {...register('tour.destination')}
          />
          <TextArea
            id="tour_meeting_point"
            label="Meeting point"
            rows={3}
            required
            error={errors.tour?.meetingPoint?.message}
            {...register('tour.meetingPoint')}
          />
          <TextInput
            id="tour_lat"
            label="Latitude"
            type="number"
            step="any"
            required
            error={errors.tour?.meetingPointCoords?.lat?.message}
            {...register('tour.meetingPointCoords.lat', { valueAsNumber: true })}
          />
          <TextInput
            id="tour_lng"
            label="Longitude"
            type="number"
            step="any"
            required
            error={errors.tour?.meetingPointCoords?.lng?.message}
            {...register('tour.meetingPointCoords.lng', { valueAsNumber: true })}
          />
        </div>
      </SectionCard>

      <SectionCard title="SEO & social image" description="Keywords and Open Graph image.">
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <FieldLabel label="Keywords" required hint="Used in page metadata" />
            <button
              type="button"
              onClick={() => setValue('tour.keywords', [...keywords, ''], { shouldDirty: true })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-zinc-50"
            >
              <FaPlus className="size-3" aria-hidden="true" />
              Add keyword
            </button>
          </div>
          <div className="space-y-3">
            {keywords.map((_, index) => (
              <div key={`keyword-${index}`} className="flex gap-2">
                <input
                  className={fieldClass(Boolean(errors.tour?.keywords?.[index]))}
                  {...register(`tour.keywords.${index}`)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (keywords.length <= 1) return
                    setValue(
                      'tour.keywords',
                      keywords.filter((__, keywordIndex) => keywordIndex !== index),
                      { shouldDirty: true },
                    )
                  }}
                  disabled={keywords.length <= 1}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl border border-zinc-200 px-3 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Remove keyword"
                >
                  <FaTrash className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <FieldError message={errors.tour?.keywords?.message} />
        </div>

        <Controller
          control={control}
          name="tour.ogImage.url"
          render={({ field }) => (
            <DeferredImagePicker
              id="tour_og_image"
              label="Open Graph image"
              hint={TOUR_OG_IMAGE_SPEC.hint}
              previewUrl={field.value || undefined}
              altText={ogImageAlt}
              altError={errors.tour?.ogImage?.alt_text?.message}
              error={errors.tour?.ogImage?.url?.message}
              onAltTextChange={(value) => {
                form.setValue('tour.ogImage.alt_text', value, { shouldDirty: true })
                if (ogImageUrl.startsWith('blob:')) {
                  setPendingAltText(ogImageUrl, value)
                }
              }}
              onSelect={(file) => {
                const previewUrl = replaceFieldFile(OG_IMAGE_FIELD_KEY, file)
                field.onChange(previewUrl)
                form.setValue('tour.ogImage.alt_text', defaultAltFromFileName(file.name), {
                  shouldDirty: true,
                })
              }}
              onClear={() => {
                removePendingField(OG_IMAGE_FIELD_KEY)
                field.onChange('')
                form.setValue(
                  'tour.ogImage.alt_text',
                  createEmptyTourSettingsValues().tour.ogImage.alt_text,
                  { shouldDirty: true },
                )
              }}
            />
          )}
        />
      </SectionCard>

      <SectionCard title="Home banner gallery" description={TOUR_BANNER_GALLERY_DESCRIPTION}>
        <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          <p className="font-medium text-heading">Recommended sizes</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs sm:text-sm">
            <li>
              <span className="font-medium">Featured (image 1):</span>{' '}
              {TOUR_BANNER_FEATURED_SPEC.width}×{TOUR_BANNER_FEATURED_SPEC.height} px (
              {TOUR_BANNER_FEATURED_SPEC.ratioLabel})
            </li>
            <li>
              <span className="font-medium">Tiles (images 2–5):</span>{' '}
              {TOUR_BANNER_TILE_SPEC.width}×{TOUR_BANNER_TILE_SPEC.height} px (
              {TOUR_BANNER_TILE_SPEC.ratioLabel})
            </li>
          </ul>
        </div>
        <div className="space-y-6">
          {([0, 1, 2, 3, 4] as const).map((index) => {
            const bannerUrl = watch(`bannerPhotos.${index}.url`)
            const bannerAlt = watch(`bannerPhotos.${index}.alt_text`)
            const fieldKey = TOUR_BANNER_FIELD_KEYS[index]
            const imageSpec = index === 0 ? TOUR_BANNER_FEATURED_SPEC : TOUR_BANNER_TILE_SPEC

            return (
              <div
                key={fieldKey}
                className="space-y-4 rounded-xl border border-zinc-100 bg-zinc-50/80 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  {index === 0 ? 'Featured banner (main)' : `Banner image ${index + 1}`}
                </p>
                <TextInput
                  id={`banner_label_${index}`}
                  label="Badge label"
                  hint="Short label shown on the photo"
                  required
                  error={errors.bannerPhotos?.[index]?.label?.message}
                  {...register(`bannerPhotos.${index}.label`)}
                />
                <Controller
                  control={control}
                  name={`bannerPhotos.${index}.url`}
                  render={({ field }) => (
                    <DeferredImagePicker
                      id={`tour_banner_${index}`}
                      label="Banner image"
                      hint={imageSpec.hint}
                      previewUrl={field.value || undefined}
                      altText={bannerAlt}
                      altError={errors.bannerPhotos?.[index]?.alt_text?.message}
                      error={errors.bannerPhotos?.[index]?.url?.message}
                      onAltTextChange={(value) => {
                        form.setValue(`bannerPhotos.${index}.alt_text`, value, {
                          shouldDirty: true,
                        })
                        if (bannerUrl.startsWith('blob:')) {
                          setPendingAltText(bannerUrl, value)
                        }
                      }}
                      onSelect={(file) => {
                        const previewUrl = replaceFieldFile(fieldKey, file)
                        field.onChange(previewUrl)
                        form.setValue(
                          `bannerPhotos.${index}.alt_text`,
                          defaultAltFromFileName(file.name),
                          { shouldDirty: true },
                        )
                      }}
                      onClear={() => {
                        removePendingField(fieldKey)
                        field.onChange('')
                        form.setValue(
                          `bannerPhotos.${index}.alt_text`,
                          createEmptyTourSettingsValues().bannerPhotos[index].alt_text,
                          { shouldDirty: true },
                        )
                      }}
                    />
                  )}
                />
              </div>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard title="FAQs" description="Home page frequently asked questions.">
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() =>
              faqsArray.append({
                id: `faq-${faqsArray.fields.length + 1}`,
                question: '',
                answer: '',
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-zinc-50"
          >
            <FaPlus className="size-3" aria-hidden="true" />
            Add FAQ
          </button>
        </div>
        <div className="space-y-4">
          {faqsArray.fields.map((field, index) => (
            <div key={field.id} className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  FAQ {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => faqsArray.remove(index)}
                  disabled={faqsArray.fields.length <= 1}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaTrash className="size-3" aria-hidden="true" />
                  Remove
                </button>
              </div>
              <TextInput
                id={`faq_id_${index}`}
                label="Id"
                required
                error={errors.faqs?.[index]?.id?.message}
                {...register(`faqs.${index}.id`)}
              />
              <TextInput
                id={`faq_question_${index}`}
                label="Question"
                required
                error={errors.faqs?.[index]?.question?.message}
                {...register(`faqs.${index}.question`, {
                  onBlur: (event) => {
                    const currentId = form.getValues(`faqs.${index}.id`)
                    if (!currentId.trim()) {
                      form.setValue(`faqs.${index}.id`, slugifyTourId(event.target.value), {
                        shouldDirty: true,
                      })
                    }
                  },
                })}
              />
              <TextArea
                id={`faq_answer_${index}`}
                label="Answer"
                required
                error={errors.faqs?.[index]?.answer?.message}
                {...register(`faqs.${index}.answer`)}
              />
            </div>
          ))}
        </div>
        <FieldError message={errors.faqs?.message ?? errors.faqs?.root?.message} />
      </SectionCard>

      <SectionCard title="Important info" description="Accordion sections on the home page.">
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() =>
              importantInfoArray.append({
                id: `section-${importantInfoArray.fields.length + 1}`,
                title: '',
                items: [''],
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-zinc-50"
          >
            <FaPlus className="size-3" aria-hidden="true" />
            Add section
          </button>
        </div>
        <div className="space-y-4">
          {importantInfoArray.fields.map((field, sectionIndex) => {
            const items = importantInfo[sectionIndex]?.items ?? ['']

            return (
              <div key={field.id} className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Section {sectionIndex + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => importantInfoArray.remove(sectionIndex)}
                    disabled={importantInfoArray.fields.length <= 1}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FaTrash className="size-3" aria-hidden="true" />
                    Remove
                  </button>
                </div>
                <TextInput
                  id={`info_id_${sectionIndex}`}
                  label="Section id"
                  required
                  error={errors.importantInfo?.[sectionIndex]?.id?.message}
                  {...register(`importantInfo.${sectionIndex}.id`)}
                />
                <TextInput
                  id={`info_title_${sectionIndex}`}
                  label="Section title"
                  required
                  error={errors.importantInfo?.[sectionIndex]?.title?.message}
                  {...register(`importantInfo.${sectionIndex}.title`, {
                    onBlur: (event) => {
                      const currentId = form.getValues(`importantInfo.${sectionIndex}.id`)
                      if (!currentId.trim()) {
                        form.setValue(
                          `importantInfo.${sectionIndex}.id`,
                          slugifyTourId(event.target.value),
                          { shouldDirty: true },
                        )
                      }
                    },
                  })}
                />
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <FieldLabel label="Items" required />
                    <button
                      type="button"
                      onClick={() =>
                        setValue(
                          `importantInfo.${sectionIndex}.items`,
                          [...items, ''],
                          { shouldDirty: true },
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-zinc-50"
                    >
                      <FaPlus className="size-3" aria-hidden="true" />
                      Add item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {items.map((_, itemIndex) => (
                      <div key={`info-item-${sectionIndex}-${itemIndex}`} className="flex gap-2">
                        <input
                          className={fieldClass(
                            Boolean(errors.importantInfo?.[sectionIndex]?.items?.[itemIndex]),
                          )}
                          {...register(`importantInfo.${sectionIndex}.items.${itemIndex}`)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (items.length <= 1) return
                            setValue(
                              `importantInfo.${sectionIndex}.items`,
                              items.filter((__, index) => index !== itemIndex),
                              { shouldDirty: true },
                            )
                          }}
                          disabled={items.length <= 1}
                          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-zinc-200 px-3 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Remove item"
                        >
                          <FaTrash className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <FieldError message={errors.importantInfo?.[sectionIndex]?.items?.message} />
                </div>
              </div>
            )
          })}
        </div>
        <FieldError message={errors.importantInfo?.message ?? errors.importantInfo?.root?.message} />
      </SectionCard>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-zinc-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            Changes apply to the public site after save. OG image uploads to cloud storage on submit.
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save tour settings'}
          </button>
        </div>
      </div>
    </form>
  )
}
