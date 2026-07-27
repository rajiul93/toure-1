import type { BlogFormValues } from '@/lib/validations/blog-form.validation'

export type AdminBlogRecord = {
  id: string
  title: string
  slug: string
  publishDate: string
  publishStatus: 'draft' | 'publish'
  isDeleted: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  form?: BlogFormValues
}

type SaveBlogResponse = {
  blog: AdminBlogRecord
}

type SaveBlogErrorResponse = {
  error?: string
}

export async function saveAdminBlog(
  mode: 'create' | 'update',
  blogId: string,
  values: BlogFormValues,
): Promise<AdminBlogRecord> {
  const url = mode === 'create' ? '/api/admin/blogs' : `/api/admin/blogs/${blogId}`
  const method = mode === 'create' ? 'POST' : 'PATCH'

  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  const data = (await response.json().catch(() => ({}))) as SaveBlogResponse & SaveBlogErrorResponse

  if (!response.ok || !data.blog) {
    throw new Error(data.error ?? 'Failed to save blog')
  }

  return data.blog
}

export async function fetchAdminBlog(blogId: string): Promise<AdminBlogRecord> {
  const response = await fetch(`/api/admin/blogs/${blogId}`, {
    credentials: 'include',
  })

  const data = (await response.json().catch(() => ({}))) as { blog?: AdminBlogRecord; error?: string }

  if (!response.ok || !data.blog) {
    throw new Error(data.error ?? 'Failed to load blog')
  }

  return data.blog
}
