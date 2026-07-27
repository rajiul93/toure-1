'use client'

import DeferredImagePicker from '@/components/admin/blog/deferred-image-picker'
import { SITE_ABOUT_ICON_KEYS, SITE_ABOUT_ICON_LABELS } from '@/lib/about-value-icons'
import { saveSiteSettingsForm } from '@/lib/admin-site-settings-api'
import { defaultAltFromFileName } from '@/lib/image-alt'
import { prepareSiteSettingsForSubmit } from '@/lib/site-settings/prepare-site-settings-submit'
import {
  createEmptySiteSettingsValues,
  siteSettingsSchema,
  type SiteSettingsFormValues,
} from '@/lib/validations/site-settings.validation'
import { usePendingImageStore } from '@/store/pending-image-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import {
  Controller,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import { FaPlus, FaTrash } from 'react-icons/fa6'

const LOGO_FIELD_KEY = 'site-settings-logo'

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


type SiteSettingsFormProps = {
  initialValues: SiteSettingsFormValues
}

export default function SiteSettingsForm({ initialValues }: SiteSettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const replaceFieldFile = usePendingImageStore((state) => state.replaceFieldFile)
  const removePendingField = usePendingImageStore((state) => state.removeField)
  const setPendingAltText = usePendingImageStore((state) => state.setAltText)
  const clearAllPending = usePendingImageStore((state) => state.clearAll)

  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
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

  const legalArray = useFieldArray({ control, name: 'legal' })
  const footerPagesArray = useFieldArray({ control, name: 'footerPages' })

  const features = watch('booking.features')

  const logoUrl = watch('brand.logo.url')
  const logoAlt = watch('brand.logo.alt_text')

  async function onSubmit(values: SiteSettingsFormValues) {
    setIsSaving(true)
    setSubmitError(null)
    setSaveMessage(null)

    try {
      const prepared = await prepareSiteSettingsForSubmit(values)
      await saveSiteSettingsForm(prepared)
      clearAllPending()
      form.reset(prepared)
      setSaveMessage('Site settings saved successfully.')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save site settings')
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
        <h1 className="text-2xl font-bold text-heading">Site configuration</h1>
        <p className="text-sm text-zinc-500">
          Update branding, contact details, booking integration, and site-wide copy. Empty fields
          fall back to built-in defaults when loading saved settings.
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

      <SectionCard
        title="Brand & logo"
        description="Site name shown in the navbar and footer. Upload a logo to replace the text brand."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput
            id="brand_name"
            label="Brand name"
            required
            error={errors.brand?.name?.message}
            {...register('brand.name')}
          />
          <TextInput
            id="brand_script"
            label="Brand script"
            hint='Styled script word, e.g. "Paris"'
            required
            error={errors.brand?.script?.message}
            {...register('brand.script')}
          />
        </div>

        <div className="mt-5">
          <Controller
            control={control}
            name="brand.logo.url"
            render={({ field }) => (
              <DeferredImagePicker
                id="site_logo"
                label="Logo"
                hint="Optional. Leave empty to show the text brand. Uploads when you save."
                previewUrl={field.value || undefined}
                altText={logoAlt}
                altError={errors.brand?.logo?.alt_text?.message}
                error={errors.brand?.logo?.url?.message}
                onAltTextChange={(value) => {
                  form.setValue('brand.logo.alt_text', value, { shouldDirty: true })
                  if (logoUrl.startsWith('blob:')) {
                    setPendingAltText(logoUrl, value)
                  }
                }}
                onSelect={(file) => {
                  const previewUrl = replaceFieldFile(LOGO_FIELD_KEY, file)
                  field.onChange(previewUrl)
                  form.setValue('brand.logo.alt_text', defaultAltFromFileName(file.name), {
                    shouldDirty: true,
                  })
                }}
                onClear={() => {
                  removePendingField(LOGO_FIELD_KEY)
                  field.onChange('')
                  form.setValue('brand.logo.alt_text', createEmptySiteSettingsValues().brand.logo.alt_text, {
                    shouldDirty: true,
                  })
                }}
              />
            )}
          />
        </div>
      </SectionCard>

      <SectionCard title="Site copy" description="Tagline and footer blurb shown across the public site.">
        <div className="space-y-5">
          <TextArea
            id="tagline"
            label="Tagline"
            required
            error={errors.tagline?.message}
            {...register('tagline')}
          />
          <TextArea
            id="footer_description"
            label="Footer description"
            required
            error={errors.footerDescription?.message}
            {...register('footerDescription')}
          />
        </div>
      </SectionCard>

      <SectionCard title="Contact" description="WhatsApp number and button labels.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput
            id="whatsapp_number"
            label="WhatsApp number"
            hint="Digits only, with country code"
            required
            error={errors.contact?.whatsappNumber?.message}
            {...register('contact.whatsappNumber')}
          />
          <TextInput
            id="whatsapp_nav_label"
            label="Navbar label"
            required
            error={errors.contact?.whatsappNavLabel?.message}
            {...register('contact.whatsappNavLabel')}
          />
          <TextInput
            id="whatsapp_cta_label"
            label="Footer CTA label"
            required
            error={errors.contact?.whatsappCtaLabel?.message}
            {...register('contact.whatsappCtaLabel')}
          />
        </div>
      </SectionCard>

      <SectionCard title="Bokun booking" description="Widget channel and experience IDs for the booking calendar.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput
            id="bokun_channel"
            label="Booking channel UUID"
            required
            error={errors.bokun?.channel?.message}
            {...register('bokun.channel')}
          />
          <TextInput
            id="bokun_experience"
            label="Experience ID"
            required
            error={errors.bokun?.experienceId?.message}
            {...register('bokun.experienceId')}
          />
        </div>
      </SectionCard>

      <SectionCard title="Booking highlights" description="Trust badges and feature bullets on the home booking card.">
        <div className="grid gap-5 sm:grid-cols-2">
          {([0, 1] as const).map((index) => (
            <div key={index} className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Trust badge {index + 1}
              </p>
              <TextInput
                id={`trust_badge_${index}`}
                label="Label"
                required
                error={errors.booking?.trustBadges?.[index]?.label?.message}
                {...register(`booking.trustBadges.${index}.label`)}
              />
              <div>
                <FieldLabel htmlFor={`trust_tone_${index}`} label="Tone" required />
                <select
                  id={`trust_tone_${index}`}
                  className={fieldClass(Boolean(errors.booking?.trustBadges?.[index]?.tone))}
                  {...register(`booking.trustBadges.${index}.tone`)}
                >
                  <option value="primary">Primary</option>
                  <option value="sky">Sky</option>
                </select>
                <FieldError message={errors.booking?.trustBadges?.[index]?.tone?.message} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <FieldLabel label="Features" required hint="Shown as bullet points on the booking widget" />
            <button
              type="button"
              onClick={() =>
                setValue('booking.features', [...features, ''], { shouldDirty: true })
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-zinc-50"
            >
              <FaPlus className="size-3" aria-hidden="true" />
              Add feature
            </button>
          </div>
          <div className="space-y-3">
            {features.map((_, index) => (
              <div key={`feature-${index}`} className="flex gap-2">
                <input
                  className={fieldClass(Boolean(errors.booking?.features?.[index]))}
                  {...register(`booking.features.${index}` as const)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (features.length <= 1) return
                    setValue(
                      'booking.features',
                      features.filter((__, featureIndex) => featureIndex !== index),
                      { shouldDirty: true },
                    )
                  }}
                  disabled={features.length <= 1}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl border border-zinc-200 px-3 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Remove feature"
                >
                  <FaTrash className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <FieldError message={errors.booking?.features?.message ?? errors.booking?.features?.root?.message} />
        </div>
      </SectionCard>

      <SectionCard title="About page" description="Copy for the public About Us page.">
        <div className="space-y-5">
          <TextArea
            id="about_metadata"
            label="Metadata description"
            required
            error={errors.about?.metadataDescription?.message}
            {...register('about.metadataDescription')}
          />
          <TextArea
            id="about_hero"
            label="Hero description"
            required
            error={errors.about?.heroDescription?.message}
            {...register('about.heroDescription')}
          />
          <TextArea
            id="about_what_we_do_0"
            label="What we do — paragraph 1"
            required
            error={errors.about?.whatWeDo?.[0]?.message}
            {...register('about.whatWeDo.0')}
          />
          <TextArea
            id="about_what_we_do_1"
            label="What we do — paragraph 2"
            required
            error={errors.about?.whatWeDo?.[1]?.message}
            {...register('about.whatWeDo.1')}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            {([0, 1, 2] as const).map((index) => (
              <div key={index} className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Value {index + 1}
                </p>
                <TextInput
                  id={`about_value_title_${index}`}
                  label="Title"
                  required
                  error={errors.about?.values?.[index]?.title?.message}
                  {...register(`about.values.${index}.title`)}
                />
                <div>
                  <FieldLabel htmlFor={`about_value_icon_${index}`} label="Icon" required />
                  <select
                    id={`about_value_icon_${index}`}
                    className={fieldClass(Boolean(errors.about?.values?.[index]?.icon))}
                    {...register(`about.values.${index}.icon`)}
                  >
                    {SITE_ABOUT_ICON_KEYS.map((iconKey) => (
                      <option key={iconKey} value={iconKey}>
                        {SITE_ABOUT_ICON_LABELS[iconKey]}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.about?.values?.[index]?.icon?.message} />
                </div>
                <TextArea
                  id={`about_value_desc_${index}`}
                  label="Description"
                  rows={3}
                  required
                  error={errors.about?.values?.[index]?.description?.message}
                  {...register(`about.values.${index}.description`)}
                />
              </div>
            ))}
          </div>

          <TextArea
            id="about_closing"
            label="Closing paragraph"
            required
            error={errors.about?.closing?.message}
            {...register('about.closing')}
          />
        </div>
      </SectionCard>

      <SectionCard title="Footer links" description="Legal links and extra footer navigation items.">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <FieldLabel label="Legal links" required />
              <button
                type="button"
                onClick={() => legalArray.append({ href: '', label: '' })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-zinc-50"
              >
                <FaPlus className="size-3" aria-hidden="true" />
                Add link
              </button>
            </div>
            <div className="space-y-3">
              {legalArray.fields.map((field, index) => (
                <div key={field.id} className="grid gap-2 rounded-xl border border-zinc-100 p-3 sm:grid-cols-[1fr_1fr_auto]">
                  <TextInput
                    id={`legal_href_${index}`}
                    label="Path"
                    error={errors.legal?.[index]?.href?.message}
                    {...register(`legal.${index}.href` as const)}
                  />
                  <TextInput
                    id={`legal_label_${index}`}
                    label="Label"
                    error={errors.legal?.[index]?.label?.message}
                    {...register(`legal.${index}.label` as const)}
                  />
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => legalArray.remove(index)}
                      disabled={legalArray.fields.length <= 1}
                      className="inline-flex size-10 items-center justify-center rounded-xl border border-zinc-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Remove legal link"
                    >
                      <FaTrash className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <FieldLabel label="Footer pages" required />
              <button
                type="button"
                onClick={() => footerPagesArray.append({ href: '', label: '' })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-zinc-50"
              >
                <FaPlus className="size-3" aria-hidden="true" />
                Add link
              </button>
            </div>
            <div className="space-y-3">
              {footerPagesArray.fields.map((field, index) => (
                <div key={field.id} className="grid gap-2 rounded-xl border border-zinc-100 p-3 sm:grid-cols-[1fr_1fr_auto]">
                  <TextInput
                    id={`footer_href_${index}`}
                    label="Path"
                    error={errors.footerPages?.[index]?.href?.message}
                    {...register(`footerPages.${index}.href` as const)}
                  />
                  <TextInput
                    id={`footer_label_${index}`}
                    label="Label"
                    error={errors.footerPages?.[index]?.label?.message}
                    {...register(`footerPages.${index}.label` as const)}
                  />
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => footerPagesArray.remove(index)}
                      disabled={footerPagesArray.fields.length <= 1}
                      className="inline-flex size-10 items-center justify-center rounded-xl border border-zinc-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Remove footer link"
                    >
                      <FaTrash className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-zinc-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            Changes apply to the public site after save. Logo uploads to cloud storage on submit.
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save site settings'}
          </button>
        </div>
      </div>
    </form>
  )
}
