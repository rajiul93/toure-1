'use client'

import {
  blogFormSchema,
  blogFormTabLabels,
  blogFormTabs,
  blogPublishStatusLabels,
  blogPublishStatusValues,
  createEmptyBlogFormValues,
  slugifyTitle,
  type BlogFormTab,
  type BlogFormValues,
} from '@/lib/validations/blog-form.validation'
import { saveAdminBlog } from '@/lib/admin-blog-api'
import { BLOG_FORM_OPTIONS } from '@/lib/blog-form-options'
import DeferredImagePicker from '@/components/admin/blog/deferred-image-picker'
import { prepareBlogFormForSubmit } from '@/lib/quill/resolve-pending-images'
import { defaultAltFromFileName } from '@/lib/image-alt'
import { usePendingImageStore } from '@/store/pending-image-store'
import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  Controller,
  useFieldArray,
  useForm,
  type FieldErrors,
  type Path,
} from 'react-hook-form'
import { FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa6'

const QuillEditor = dynamic(() => import('@/components/admin/blog/quill-editor'), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-500">
      Loading editor…
    </div>
  ),
})

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

function countTabErrors(errors: FieldErrors<BlogFormValues>, tab: BlogFormTab): number {
  if (tab === 'basic_info') {
    return Object.keys(errors.basic_info ?? {}).length
  }
  if (tab === 'faqs') {
    return errors.faqs?.length ?? (errors.faqs ? 1 : 0)
  }
  if (tab === 'meta_data') {
    return Object.keys(errors.meta_data ?? {}).length
  }
  return Object.keys(errors.social_meta_data ?? {}).length
}

type BlogFormProps = {
  mode: 'create' | 'update'
  blogId: string
  initialValues: BlogFormValues
}

export default function BlogForm({ mode, blogId, initialValues }: BlogFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<BlogFormTab>('basic_info')
  const [slugEdited, setSlugEdited] = useState(mode === 'update')
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editorRevision, setEditorRevision] = useState(0)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

  const addPendingFile = usePendingImageStore((state) => state.addFile)
  const removePendingField = usePendingImageStore((state) => state.removeField)
  const setPendingAltText = usePendingImageStore((state) => state.setAltText)

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: initialValues,
    mode: 'onBlur',
  })

  const {
    control,
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'faqs',
  })

  const selectedTags = watch('basic_info.tags')
  const selectedKeywords = watch('basic_info.keywords')
  const publishStatus = watch('basic_info.publish_status')
  const blogSlug = watch('basic_info.slug')
  const featuredImageUrl = watch('basic_info.featured_image.url')
  const featuredImageAlt = watch('basic_info.featured_image.alt_text')
  const metaImageUrl = watch('meta_data.meta_image.url')
  const metaImageAlt = watch('meta_data.meta_image.alt_text')
  const fbMetaImageUrl = watch('social_meta_data.fb_meta_image.url')
  const fbMetaImageAlt = watch('social_meta_data.fb_meta_image.alt_text')

  const tabErrors = useMemo(
    () =>
      Object.fromEntries(
        blogFormTabs.map((tab) => [tab, countTabErrors(errors, tab)]),
      ) as Record<BlogFormTab, number>,
    [errors],
  )

  function toggleTag(tagId: string) {
    const current = selectedTags ?? []
    if (current.includes(tagId)) {
      setValue(
        'basic_info.tags',
        current.filter((id) => id !== tagId),
        { shouldDirty: true, shouldValidate: true },
      )
      return
    }

    setValue('basic_info.tags', [...current, tagId], {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  function addKeyword(keyword: string) {
    const trimmed = keyword.trim()
    if (!trimmed) return

    const current = selectedKeywords ?? []
    if (current.includes(trimmed)) return

    setValue('basic_info.keywords', [...current, trimmed], {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  function removeKeyword(keyword: string) {
    setValue(
      'basic_info.keywords',
      (selectedKeywords ?? []).filter((item) => item !== keyword),
      { shouldDirty: true, shouldValidate: true },
    )
  }

  async function onSubmit(values: BlogFormValues) {
    setIsSaving(true)
    setSubmitError(null)

    try {
      const finalValues = await prepareBlogFormForSubmit(values)
      const blog = await saveAdminBlog(mode, blogId, finalValues)
      usePendingImageStore.getState().clearAll()

      if (blog.form) {
        reset(blog.form)
        setEditorRevision((revision) => revision + 1)
      }
      setLastSavedAt(blog.updatedAt)

      if (mode === 'create') {
        router.push(`/admin/blogs/${blog.id}`)
        router.refresh()
        return
      }

      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save blog'
      setSubmitError(message)
      console.error('[blog-form:save-error]', error)
    } finally {
      setIsSaving(false)
    }
  }

  function onInvalid(formErrors: FieldErrors<BlogFormValues>) {
    console.log('[blog-form:validation-errors]', formErrors)

    const firstTabWithError = blogFormTabs.find((tab) => countTabErrors(formErrors, tab) > 0)
    if (firstTabWithError) {
      setActiveTab(firstTabWithError)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="mx-auto max-w-5xl space-y-6">
      <div className="sticky top-0 z-20 -mx-4 border-b border-zinc-200 bg-zinc-50/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/blogs"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-heading"
            >
              <FaArrowLeft className="size-3.5" aria-hidden="true" />
              Back to blogs
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-heading">
              {mode === 'create' ? 'Create blog post' : 'Update blog post'}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {mode === 'create'
                ? 'Fill in all tabs, then save to publish the blog post.'
                : `Editing blog ID: ${blogId}`}
            </p>
            {submitError ? (
              <p className="mt-2 text-sm font-medium text-red-600">{submitError}</p>
            ) : null}
            {lastSavedAt ? (
              <p className="mt-2 text-xs text-zinc-500">
                Saved {new Date(lastSavedAt).toLocaleString()}
                {publishStatus === 'publish' && blogSlug ? (
                  <>
                    {' '}
                    ·{' '}
                    <Link
                      href={`/blog/${blogSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      View live post
                    </Link>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isSaving}
            className="inline-flex items-center justify-center rounded-xl bg-heading px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-heading/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : mode === 'create' ? 'Create blog' : 'Update blog'}
          </button>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {blogFormTabs.map((tab) => {
            const isActive = activeTab === tab
            const errorCount = tabErrors[tab]

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={[
                  'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:text-heading',
                ].join(' ')}
              >
                {blogFormTabLabels[tab]}
                {errorCount > 0 ? (
                  <span
                    className={[
                      'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700',
                    ].join(' ')}
                  >
                    {errorCount}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'basic_info' ? (
        <div className="space-y-6">
          <SectionCard
            title="Schedule & classification"
            description="Set publishing dates and organize the post."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="blog_date" label="Blog date" required />
                <input
                  id="blog_date"
                  type="date"
                  className={fieldClass(!!errors.basic_info?.blog_date)}
                  {...register('basic_info.blog_date')}
                />
                <FieldError message={errors.basic_info?.blog_date?.message} />
              </div>

              <div>
                <FieldLabel htmlFor="publish_date" label="Publish date" required />
                <input
                  id="publish_date"
                  type="date"
                  className={fieldClass(!!errors.basic_info?.publish_date)}
                  {...register('basic_info.publish_date')}
                />
                <FieldError message={errors.basic_info?.publish_date?.message} />
              </div>

              <div>
                <FieldLabel htmlFor="publish_status" label="Publish status" required />
                <select
                  id="publish_status"
                  className={fieldClass(!!errors.basic_info?.publish_status)}
                  {...register('basic_info.publish_status')}
                >
                  {blogPublishStatusValues.map((status) => (
                    <option key={status} value={status}>
                      {blogPublishStatusLabels[status]}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.basic_info?.publish_status?.message} />
              </div>

              <div>
                <FieldLabel htmlFor="author_id" label="Author" required />
                <select
                  id="author_id"
                  className={fieldClass(!!errors.basic_info?.author_id)}
                  {...register('basic_info.author_id')}
                >
                  <option value="">Select author</option>
                  {BLOG_FORM_OPTIONS.authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.basic_info?.author_id?.message} />
              </div>

              <div>
                <FieldLabel htmlFor="category_id" label="Category" required />
                <select
                  id="category_id"
                  className={fieldClass(!!errors.basic_info?.category_id)}
                  {...register('basic_info.category_id')}
                >
                  <option value="">Select category</option>
                  {BLOG_FORM_OPTIONS.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.basic_info?.category_id?.message} />
              </div>

              <div className="sm:col-span-2">
                <FieldLabel htmlFor="country_id" label="Country" required />
                <select
                  id="country_id"
                  className={fieldClass(!!errors.basic_info?.country_id)}
                  {...register('basic_info.country_id')}
                >
                  <option value="">Select country</option>
                  {BLOG_FORM_OPTIONS.countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.basic_info?.country_id?.message} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Content" description="Main blog title, slug, and body content.">
            <div className="space-y-4">
              <div>
                <FieldLabel htmlFor="title" label="Title" required />
                <input
                  id="title"
                  className={fieldClass(!!errors.basic_info?.title)}
                  placeholder="Blog title"
                  {...register('basic_info.title', {
                    onChange: (event) => {
                      if (slugEdited) return
                      setValue('basic_info.slug', slugifyTitle(event.target.value), {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    },
                  })}
                />
                <FieldError message={errors.basic_info?.title?.message} />
              </div>

              <div>
                <FieldLabel
                  htmlFor="slug"
                  label="Slug"
                  hint="Auto-generated from title. Edit manually if needed."
                  required
                />
                <input
                  id="slug"
                  className={fieldClass(!!errors.basic_info?.slug)}
                  placeholder="blog-title-here"
                  {...register('basic_info.slug', {
                    onChange: () => setSlugEdited(true),
                  })}
                />
                <FieldError message={errors.basic_info?.slug?.message} />
              </div>

              <div>
                <FieldLabel htmlFor="short_description" label="Short description" required />
                <textarea
                  id="short_description"
                  rows={3}
                  className={fieldClass(!!errors.basic_info?.short_description)}
                  placeholder="A short summary shown in listings..."
                  {...register('basic_info.short_description')}
                />
                <FieldError message={errors.basic_info?.short_description?.message} />
              </div>

              <div>
                <FieldLabel label="Description" hint="Full blog content." required />
                <Controller
                  control={control}
                  name="basic_info.description"
                  render={({ field }) => (
                    <QuillEditor
                      key={`description-${editorRevision}`}
                      id="description"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write the full blog post..."
                      minHeight={280}
                    />
                  )}
                />
                <FieldError message={errors.basic_info?.description?.message} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Tags & keywords" description="Improve discoverability and SEO.">
            <div className="space-y-5">
              <div>
                <FieldLabel label="Tags" hint="Select one or more tags." />
                <div className="flex flex-wrap gap-2">
                  {BLOG_FORM_OPTIONS.tags.map((tag) => {
                    const selected = selectedTags?.includes(tag.id)

                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={[
                          'rounded-full px-3 py-1.5 text-sm font-medium transition',
                          selected
                            ? 'bg-primary-soft text-primary-dark ring-1 ring-primary/20'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
                        ].join(' ')}
                      >
                        {tag.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <FieldLabel
                  htmlFor="keyword_input"
                  label="Keywords"
                  hint="Type a keyword and press Enter to add."
                />
                <input
                  id="keyword_input"
                  className={fieldClass()}
                  placeholder="Add keyword and press Enter"
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return
                    event.preventDefault()
                    addKeyword(event.currentTarget.value)
                    event.currentTarget.value = ''
                  }}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {(selectedKeywords ?? []).map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="text-zinc-400 transition hover:text-red-600"
                        aria-label={`Remove ${keyword}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Featured image"
            description="Choose a cover image. It uploads when you submit the form."
          >
            <div className="space-y-4">
              <DeferredImagePicker
                id="featured_image_file"
                label="Featured image"
                hint="Select an image file. No URL input needed."
                previewUrl={featuredImageUrl || undefined}
                altText={featuredImageAlt}
                onAltTextChange={(alt) => {
                  setValue('basic_info.featured_image.alt_text', alt, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                  if (featuredImageUrl?.startsWith('blob:')) {
                    setPendingAltText(featuredImageUrl, alt)
                  }
                }}
                altError={errors.basic_info?.featured_image?.alt_text?.message}
                onSelect={(file) => {
                  const defaultAlt = defaultAltFromFileName(file.name)
                  const previewUrl = addPendingFile(file, 'featured_image')
                  setValue('basic_info.featured_image.url', previewUrl, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })

                  const currentAlt = getValues('basic_info.featured_image.alt_text')
                  const nextAlt = currentAlt.trim() ? currentAlt : defaultAlt
                  setValue('basic_info.featured_image.alt_text', nextAlt, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                  setPendingAltText(previewUrl, nextAlt)
                }}
                onClear={() => {
                  removePendingField('featured_image')
                  setValue('basic_info.featured_image.url', '', {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                  setValue('basic_info.featured_image.alt_text', '', {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }}
                error={errors.basic_info?.featured_image?.url?.message}
              />

              <label className="inline-flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3">
                <input
                  type="checkbox"
                  className="size-4 rounded border-zinc-300 text-primary focus:ring-primary/30"
                  {...register('basic_info.is_featured')}
                />
                <span className="text-sm font-medium text-heading">Mark as featured blog</span>
              </label>
            </div>
          </SectionCard>
        </div>
      ) : null}

      {activeTab === 'faqs' ? (
        <SectionCard
          title="FAQs"
          description="Add common questions and answers for this blog post."
        >
          <div className="space-y-4">
            {fields.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center">
                <p className="text-sm text-zinc-500">No FAQs yet. Add your first question below.</p>
              </div>
            ) : null}

            {fields.map((field, index) => (
              <div key={field.id} className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-heading">FAQ {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <FaTrash className="size-3.5" aria-hidden="true" />
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <FieldLabel label="Question" required />
                    <input
                      className={fieldClass(!!errors.faqs?.[index]?.question)}
                      placeholder="Frequently asked question?"
                      {...register(`faqs.${index}.question` as Path<BlogFormValues>)}
                    />
                    <FieldError message={errors.faqs?.[index]?.question?.message} />
                  </div>

                  <div>
                    <FieldLabel label="Answer" required />
                    <Controller
                      control={control}
                      name={`faqs.${index}.answer`}
                      render={({ field: answerField }) => (
                        <QuillEditor
                          key={`faq-${index}-${editorRevision}`}
                          value={answerField.value}
                          onChange={answerField.onChange}
                          placeholder="Write the answer..."
                          minHeight={180}
                        />
                      )}
                    />
                    <FieldError message={errors.faqs?.[index]?.answer?.message} />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => append({ question: '', answer: '' })}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-heading transition hover:bg-zinc-50"
            >
              <FaPlus className="size-3.5" aria-hidden="true" />
              Add FAQ
            </button>
          </div>
        </SectionCard>
      ) : null}

      {activeTab === 'meta_data' ? (
        <SectionCard title="Meta data" description="Search engine title, description, and image.">
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="meta_title" label="Meta title" required />
              <input
                id="meta_title"
                className={fieldClass(!!errors.meta_data?.meta_title)}
                placeholder="SEO title"
                {...register('meta_data.meta_title')}
              />
              <FieldError message={errors.meta_data?.meta_title?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="meta_description" label="Meta description" required />
              <textarea
                id="meta_description"
                rows={4}
                className={fieldClass(!!errors.meta_data?.meta_description)}
                placeholder="SEO description"
                {...register('meta_data.meta_description')}
              />
              <FieldError message={errors.meta_data?.meta_description?.message} />
            </div>

            <DeferredImagePicker
              id="meta_image_file"
              label="Meta image"
              hint="Optional SEO image. Uploads on final submit."
              previewUrl={metaImageUrl || undefined}
              altText={metaImageAlt}
              onAltTextChange={(alt) => {
                setValue('meta_data.meta_image.alt_text', alt, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
                if (metaImageUrl?.startsWith('blob:')) {
                  setPendingAltText(metaImageUrl, alt)
                }
              }}
              onSelect={(file) => {
                const defaultAlt = defaultAltFromFileName(file.name)
                const previewUrl = addPendingFile(file, 'meta_image')
                setValue('meta_data.meta_image.url', previewUrl, {
                  shouldDirty: true,
                  shouldValidate: true,
                })

                const currentAlt = getValues('meta_data.meta_image.alt_text')
                const nextAlt = currentAlt.trim() ? currentAlt : defaultAlt
                setValue('meta_data.meta_image.alt_text', nextAlt, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
                setPendingAltText(previewUrl, nextAlt)
              }}
              onClear={() => {
                removePendingField('meta_image')
                setValue('meta_data.meta_image.url', '', {
                  shouldDirty: true,
                  shouldValidate: true,
                })
                setValue('meta_data.meta_image.alt_text', '', {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
              error={errors.meta_data?.meta_image?.url?.message}
            />
          </div>
        </SectionCard>
      ) : null}

      {activeTab === 'social_meta_data' ? (
        <SectionCard
          title="Social meta data"
          description="Facebook/Open Graph preview fields."
        >
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="fb_meta_title" label="Facebook meta title" />
              <input
                id="fb_meta_title"
                className={fieldClass()}
                placeholder="Facebook title"
                {...register('social_meta_data.fb_meta_title')}
              />
            </div>

            <div>
              <FieldLabel htmlFor="fb_meta_description" label="Facebook meta description" />
              <textarea
                id="fb_meta_description"
                rows={4}
                className={fieldClass()}
                placeholder="Facebook description"
                {...register('social_meta_data.fb_meta_description')}
              />
            </div>

            <DeferredImagePicker
              id="fb_meta_image_file"
              label="Facebook meta image"
              hint="Optional social share image. Uploads on final submit."
              previewUrl={fbMetaImageUrl || undefined}
              altText={fbMetaImageAlt}
              onAltTextChange={(alt) => {
                setValue('social_meta_data.fb_meta_image.alt_text', alt, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
                if (fbMetaImageUrl?.startsWith('blob:')) {
                  setPendingAltText(fbMetaImageUrl, alt)
                }
              }}
              onSelect={(file) => {
                const defaultAlt = defaultAltFromFileName(file.name)
                const previewUrl = addPendingFile(file, 'fb_meta_image')
                setValue('social_meta_data.fb_meta_image.url', previewUrl, {
                  shouldDirty: true,
                  shouldValidate: true,
                })

                const currentAlt = getValues('social_meta_data.fb_meta_image.alt_text')
                const nextAlt = currentAlt.trim() ? currentAlt : defaultAlt
                setValue('social_meta_data.fb_meta_image.alt_text', nextAlt, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
                setPendingAltText(previewUrl, nextAlt)
              }}
              onClear={() => {
                removePendingField('fb_meta_image')
                setValue('social_meta_data.fb_meta_image.url', '', {
                  shouldDirty: true,
                  shouldValidate: true,
                })
                setValue('social_meta_data.fb_meta_image.alt_text', '', {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
              error={errors.social_meta_data?.fb_meta_image?.url?.message}
            />
          </div>
        </SectionCard>
      ) : null}
    </form>
  )
}
