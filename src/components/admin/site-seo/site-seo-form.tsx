'use client'

import DeferredImagePicker from '@/components/admin/blog/deferred-image-picker'
import { saveSiteSeoSettingsForm } from '@/lib/admin-site-seo-api'
import { defaultAltFromFileName } from '@/lib/image-alt'
import {
  OG_IMAGE_FIELD_KEY,
  ORG_LOGO_FIELD_KEY,
  prepareSiteSeoSettingsForSubmit,
} from '@/lib/site-seo/prepare-site-seo-submit'
import type { SeoPageKey } from '@/lib/site-seo.types'
import { SEO_PAGE_PATHS } from '@/lib/site-seo.types'
import {
  createEmptySiteSeoSettingsValues,
  SEO_PAGE_LABELS,
  siteSeoSettingsSchema,
  type SiteSeoSettingsFormValues,
} from '@/lib/validations/site-seo.validation'
import { usePendingImageStore } from '@/store/pending-image-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FaPlus, FaTrash } from 'react-icons/fa6'

const PAGE_KEYS = Object.keys(SEO_PAGE_LABELS) as SeoPageKey[]

const SITEMAP_FREQUENCIES = [
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
] as const

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

type SiteSeoFormProps = {
  initialValues: SiteSeoSettingsFormValues
}

export default function SiteSeoForm({ initialValues }: SiteSeoFormProps) {
  const [activePage, setActivePage] = useState<SeoPageKey>('home')
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const replaceFieldFile = usePendingImageStore((state) => state.replaceFieldFile)
  const removePendingField = usePendingImageStore((state) => state.removeField)
  const setPendingAltText = usePendingImageStore((state) => state.setAltText)
  const clearAllPending = usePendingImageStore((state) => state.clearAll)

  const form = useForm<SiteSeoSettingsFormValues>({
    resolver: zodResolver(siteSeoSettingsSchema),
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

  const defaultKeywords = watch('global.defaultKeywords')
  const disallowPaths = watch('crawlers.disallowPaths')
  const sameAs = watch('organization.sameAs')
  const ogDefaultUrl = watch('openGraph.defaultImage.url')
  const ogDefaultAlt = watch('openGraph.defaultImage.alt_text')
  const orgLogoUrl = watch('organization.logo.url')
  const orgLogoAlt = watch('organization.logo.alt_text')
  const pageKeywords = watch(`pages.${activePage}.keywords`)
  const pageOgUrl = watch(`pages.${activePage}.ogImage.url`)
  const pageOgAlt = watch(`pages.${activePage}.ogImage.alt_text`)

  async function onSubmit(values: SiteSeoSettingsFormValues) {
    setIsSaving(true)
    setSubmitError(null)
    setSaveMessage(null)

    try {
      const prepared = await prepareSiteSeoSettingsForSubmit(values)
      await saveSiteSeoSettingsForm(prepared)
      clearAllPending()
      form.reset(prepared)
      setSaveMessage('SEO settings saved. Metadata, sitemap, and robots.txt will update shortly.')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save SEO settings')
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
        <h1 className="text-2xl font-bold text-heading">Site SEO</h1>
        <p className="text-sm text-zinc-500">
          Control metadata, Open Graph, Twitter cards, schema.org organization, robots.txt, and
          per-page SEO. Defaults are pre-filled for a new site — nothing starts empty.
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
        title="Global SEO"
        description="Site-wide title template, keywords, language, and search engine verification."
      >
        <div className="space-y-5">
          <TextInput
            id="title_template"
            label="Title template"
            hint='Use %s for page title, e.g. "%s | Day Tour Paris"'
            required
            error={errors.global?.titleTemplate?.message}
            {...register('global.titleTemplate')}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput
              id="locale"
              label="Locale"
              required
              error={errors.global?.locale?.message}
              {...register('global.locale')}
            />
            <TextInput
              id="language"
              label="HTML language"
              hint="e.g. en, fr"
              required
              error={errors.global?.language?.message}
              {...register('global.language')}
            />
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="inline-flex items-center gap-2 text-sm text-heading">
              <input type="checkbox" className="size-4 rounded border-zinc-300" {...register('global.robotsIndex')} />
              Allow indexing (robots index)
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-heading">
              <input type="checkbox" className="size-4 rounded border-zinc-300" {...register('global.robotsFollow')} />
              Allow following links (robots follow)
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <TextInput
              id="google_verification"
              label="Google Search Console"
              hint="Verification meta content"
              error={errors.global?.googleSiteVerification?.message}
              {...register('global.googleSiteVerification')}
            />
            <TextInput
              id="bing_verification"
              label="Bing Webmaster"
              error={errors.global?.bingSiteVerification?.message}
              {...register('global.bingSiteVerification')}
            />
            <TextInput
              id="yandex_verification"
              label="Yandex"
              error={errors.global?.yandexVerification?.message}
              {...register('global.yandexVerification')}
            />
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <FieldLabel label="Default keywords" required hint="Used when a page has no specific keywords" />
              <button
                type="button"
                onClick={() =>
                  setValue('global.defaultKeywords', [...defaultKeywords, ''], { shouldDirty: true })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-zinc-50"
              >
                <FaPlus className="size-3" aria-hidden="true" />
                Add keyword
              </button>
            </div>
            <div className="space-y-2">
              {defaultKeywords.map((_, index) => (
                <div key={`global-kw-${index}`} className="flex gap-2">
                  <input
                    className={fieldClass(Boolean(errors.global?.defaultKeywords?.[index]))}
                    {...register(`global.defaultKeywords.${index}`)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (defaultKeywords.length <= 1) return
                      setValue(
                        'global.defaultKeywords',
                        defaultKeywords.filter((__, i) => i !== index),
                        { shouldDirty: true },
                      )
                    }}
                    disabled={defaultKeywords.length <= 1}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl border border-zinc-200 px-3 text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                    aria-label="Remove keyword"
                  >
                    <FaTrash className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Open Graph" description="Default social sharing image and site name.">
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput
              id="og_site_name"
              label="OG site name"
              required
              error={errors.openGraph?.siteName?.message}
              {...register('openGraph.siteName')}
            />
            <TextInput
              id="og_locale"
              label="OG locale"
              required
              error={errors.openGraph?.locale?.message}
              {...register('openGraph.locale')}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput
              id="og_width"
              label="Default image width"
              type="number"
              required
              error={errors.openGraph?.defaultImage?.width?.message}
              {...register('openGraph.defaultImage.width', { valueAsNumber: true })}
            />
            <TextInput
              id="og_height"
              label="Default image height"
              type="number"
              required
              error={errors.openGraph?.defaultImage?.height?.message}
              {...register('openGraph.defaultImage.height', { valueAsNumber: true })}
            />
          </div>
          <Controller
            control={control}
            name="openGraph.defaultImage.url"
            render={({ field }) => (
              <DeferredImagePicker
                id="seo_og_default"
                label="Default OG image"
                hint="1200×630 recommended. Uploads on save."
                previewUrl={field.value || undefined}
                altText={ogDefaultAlt}
                altError={errors.openGraph?.defaultImage?.alt_text?.message}
                error={errors.openGraph?.defaultImage?.url?.message}
                onAltTextChange={(value) => {
                  form.setValue('openGraph.defaultImage.alt_text', value, { shouldDirty: true })
                  if (ogDefaultUrl.startsWith('blob:')) setPendingAltText(ogDefaultUrl, value)
                }}
                onSelect={(file) => {
                  const previewUrl = replaceFieldFile(OG_IMAGE_FIELD_KEY, file)
                  field.onChange(previewUrl)
                  form.setValue('openGraph.defaultImage.alt_text', defaultAltFromFileName(file.name), {
                    shouldDirty: true,
                  })
                }}
                onClear={() => {
                  removePendingField(OG_IMAGE_FIELD_KEY)
                  field.onChange('')
                  form.setValue(
                    'openGraph.defaultImage.alt_text',
                    createEmptySiteSeoSettingsValues().openGraph.defaultImage.alt_text,
                    { shouldDirty: true },
                  )
                }}
              />
            )}
          />
        </div>
      </SectionCard>

      <SectionCard title="Twitter / X" description="Twitter card type and optional handles.">
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <FieldLabel htmlFor="twitter_card" label="Card type" required />
            <select
              id="twitter_card"
              className={fieldClass(Boolean(errors.twitter?.card))}
              {...register('twitter.card')}
            >
              <option value="summary_large_image">Summary large image</option>
              <option value="summary">Summary</option>
            </select>
          </div>
          <TextInput
            id="twitter_site"
            label="Site handle"
            hint="@daytourparis"
            error={errors.twitter?.site?.message}
            {...register('twitter.site')}
          />
          <TextInput
            id="twitter_creator"
            label="Creator handle"
            error={errors.twitter?.creator?.message}
            {...register('twitter.creator')}
          />
        </div>
      </SectionCard>

      <SectionCard title="Organization schema" description="JSON-LD Organization for rich results.">
        <div className="space-y-5">
          <TextInput
            id="org_name"
            label="Organization name"
            required
            error={errors.organization?.name?.message}
            {...register('organization.name')}
          />
          <TextArea
            id="org_description"
            label="Organization description"
            required
            error={errors.organization?.description?.message}
            {...register('organization.description')}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput
              id="org_email"
              label="Contact email"
              error={errors.organization?.email?.message}
              {...register('organization.email')}
            />
            <TextInput
              id="org_phone"
              label="Telephone"
              error={errors.organization?.telephone?.message}
              {...register('organization.telephone')}
            />
          </div>
          <Controller
            control={control}
            name="organization.logo.url"
            render={({ field }) => (
              <DeferredImagePicker
                id="seo_org_logo"
                label="Organization logo"
                hint="Square logo for schema.org. Optional."
                previewUrl={field.value || undefined}
                altText={orgLogoAlt}
                altError={errors.organization?.logo?.alt_text?.message}
                error={errors.organization?.logo?.url?.message}
                onAltTextChange={(value) => {
                  form.setValue('organization.logo.alt_text', value, { shouldDirty: true })
                  if (orgLogoUrl.startsWith('blob:')) setPendingAltText(orgLogoUrl, value)
                }}
                onSelect={(file) => {
                  const previewUrl = replaceFieldFile(ORG_LOGO_FIELD_KEY, file)
                  field.onChange(previewUrl)
                  form.setValue('organization.logo.alt_text', defaultAltFromFileName(file.name), {
                    shouldDirty: true,
                  })
                }}
                onClear={() => {
                  removePendingField(ORG_LOGO_FIELD_KEY)
                  field.onChange('')
                  form.setValue(
                    'organization.logo.alt_text',
                    createEmptySiteSeoSettingsValues().organization.logo.alt_text,
                    { shouldDirty: true },
                  )
                }}
              />
            )}
          />
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <FieldLabel label="Social profiles (sameAs)" hint="Full URLs to social pages" />
              <button
                type="button"
                onClick={() => setValue('organization.sameAs', [...sameAs, ''], { shouldDirty: true })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-zinc-50"
              >
                <FaPlus className="size-3" aria-hidden="true" />
                Add URL
              </button>
            </div>
            <div className="space-y-2">
              {sameAs.map((_, index) => (
                <div key={`same-as-${index}`} className="flex gap-2">
                  <input
                    className={fieldClass(Boolean(errors.organization?.sameAs?.[index]))}
                    placeholder="https://..."
                    {...register(`organization.sameAs.${index}`)}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        'organization.sameAs',
                        sameAs.filter((__, i) => i !== index),
                        { shouldDirty: true },
                      )
                    }
                    className="inline-flex shrink-0 items-center justify-center rounded-xl border border-zinc-200 px-3 text-red-600 transition hover:bg-red-50"
                    aria-label="Remove URL"
                  >
                    <FaTrash className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Crawlers & robots.txt" description="Control bot access and blocked paths.">
        <label className="mb-4 inline-flex items-center gap-2 text-sm text-heading">
          <input
            type="checkbox"
            className="size-4 rounded border-zinc-300"
            {...register('crawlers.allowAiBots')}
          />
          Allow AI crawlers (GPTBot, ClaudeBot, PerplexityBot)
        </label>
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <FieldLabel label="Disallow paths" required hint="Paths blocked in robots.txt" />
            <button
              type="button"
              onClick={() =>
                setValue('crawlers.disallowPaths', [...disallowPaths, ''], { shouldDirty: true })
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-zinc-50"
            >
              <FaPlus className="size-3" aria-hidden="true" />
              Add path
            </button>
          </div>
          <div className="space-y-2">
            {disallowPaths.map((_, index) => (
              <div key={`disallow-${index}`} className="flex gap-2">
                <input
                  className={fieldClass(Boolean(errors.crawlers?.disallowPaths?.[index]))}
                  placeholder="/private"
                  {...register(`crawlers.disallowPaths.${index}`)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (disallowPaths.length <= 1) return
                    setValue(
                      'crawlers.disallowPaths',
                      disallowPaths.filter((__, i) => i !== index),
                      { shouldDirty: true },
                    )
                  }}
                  disabled={disallowPaths.length <= 1}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl border border-zinc-200 px-3 text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                  aria-label="Remove path"
                >
                  <FaTrash className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Per-page SEO"
        description="Title, description, keywords, OG image, and sitemap settings for each public page."
      >
        <div className="mb-5 flex flex-wrap gap-2">
          {PAGE_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActivePage(key)}
              className={
                activePage === key
                  ? 'rounded-xl bg-primary-soft px-3 py-2 text-xs font-semibold text-primary-dark'
                  : 'rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50'
              }
            >
              {SEO_PAGE_LABELS[key]}
            </button>
          ))}
        </div>

        <p className="mb-4 text-xs text-zinc-500">
          Path: <span className="font-mono text-zinc-700">{SEO_PAGE_PATHS[activePage]}</span>
        </p>

        <div className="space-y-5">
          <TextInput
            id={`page_title_${activePage}`}
            label="Meta title"
            required
            error={errors.pages?.[activePage]?.title?.message}
            {...register(`pages.${activePage}.title`)}
          />
          <TextArea
            id={`page_desc_${activePage}`}
            label="Meta description"
            required
            error={errors.pages?.[activePage]?.description?.message}
            {...register(`pages.${activePage}.description`)}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput
              id={`page_priority_${activePage}`}
              label="Sitemap priority"
              type="number"
              step="0.1"
              min={0}
              max={1}
              required
              error={errors.pages?.[activePage]?.sitemapPriority?.message}
              {...register(`pages.${activePage}.sitemapPriority`, { valueAsNumber: true })}
            />
            <div>
              <FieldLabel htmlFor={`page_freq_${activePage}`} label="Sitemap change frequency" required />
              <select
                id={`page_freq_${activePage}`}
                className={fieldClass(Boolean(errors.pages?.[activePage]?.sitemapChangeFrequency))}
                {...register(`pages.${activePage}.sitemapChangeFrequency`)}
              >
                {SITEMAP_FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <FieldLabel label="Page keywords" required />
              <button
                type="button"
                onClick={() =>
                  setValue(
                    `pages.${activePage}.keywords`,
                    [...pageKeywords, ''],
                    { shouldDirty: true },
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-zinc-50"
              >
                <FaPlus className="size-3" aria-hidden="true" />
                Add keyword
              </button>
            </div>
            <div className="space-y-2">
              {pageKeywords.map((_, index) => (
                <div key={`page-kw-${activePage}-${index}`} className="flex gap-2">
                  <input
                    className={fieldClass(Boolean(errors.pages?.[activePage]?.keywords?.[index]))}
                    {...register(`pages.${activePage}.keywords.${index}`)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (pageKeywords.length <= 1) return
                      setValue(
                        `pages.${activePage}.keywords`,
                        pageKeywords.filter((__, i) => i !== index),
                        { shouldDirty: true },
                      )
                    }}
                    disabled={pageKeywords.length <= 1}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl border border-zinc-200 px-3 text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                    aria-label="Remove keyword"
                  >
                    <FaTrash className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <Controller
            control={control}
            name={`pages.${activePage}.ogImage.url`}
            render={({ field }) => (
              <DeferredImagePicker
                id={`seo_page_og_${activePage}`}
                label="Page OG image override"
                hint="Leave empty to use the global default OG image."
                previewUrl={field.value || undefined}
                altText={pageOgAlt}
                altError={errors.pages?.[activePage]?.ogImage?.alt_text?.message}
                error={errors.pages?.[activePage]?.ogImage?.url?.message}
                onAltTextChange={(value) => {
                  form.setValue(`pages.${activePage}.ogImage.alt_text`, value, { shouldDirty: true })
                  if (pageOgUrl.startsWith('blob:')) setPendingAltText(pageOgUrl, value)
                }}
                onSelect={(file) => {
                  const fieldKey = `seo-page-og-${activePage}`
                  const previewUrl = replaceFieldFile(fieldKey, file)
                  field.onChange(previewUrl)
                  form.setValue(`pages.${activePage}.ogImage.alt_text`, defaultAltFromFileName(file.name), {
                    shouldDirty: true,
                  })
                }}
                onClear={() => {
                  removePendingField(`seo-page-og-${activePage}`)
                  field.onChange('')
                  form.setValue(`pages.${activePage}.ogImage.alt_text`, '', { shouldDirty: true })
                }}
              />
            )}
          />
        </div>
      </SectionCard>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-zinc-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            Saves metadata, sitemap priorities, robots.txt rules, and schema.org organization data.
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save SEO settings'}
          </button>
        </div>
      </div>
    </form>
  )
}
