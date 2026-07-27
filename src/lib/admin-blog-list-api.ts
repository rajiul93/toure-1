import type { BlogPublishStatus } from '@/lib/validations/blog-form.validation'

export type AdminBlogListItem = {
  id: string
  title: string
  createdAt: string
  publishDate: string
  thumbnailUrl: string
  thumbnailAlt: string
  publishStatus: BlogPublishStatus
}

export type AdminBlogListResponse = {
  items: AdminBlogListItem[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const ADMIN_BLOG_LIST_QUERY_KEY = 'admin-blogs'

export function adminBlogListQueryKey(page: number, search: string) {
  return [ADMIN_BLOG_LIST_QUERY_KEY, page, search] as const
}

type ApiErrorResponse = {
  error?: string
}

export async function fetchAdminBlogs(params: {
  page: number
  limit: number
  search?: string
}): Promise<AdminBlogListResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  })

  if (params.search?.trim()) {
    query.set('search', params.search.trim())
  }

  const response = await fetch(`/api/admin/blogs?${query.toString()}`, {
    credentials: 'include',
  })

  const data = (await response.json().catch(() => ({}))) as AdminBlogListResponse & ApiErrorResponse

  if (!response.ok || !Array.isArray(data.items)) {
    throw new Error(data.error ?? 'Failed to load blogs')
  }

  return data
}

export async function toggleAdminBlogPublishStatus(
  blogId: string,
  publishStatus: BlogPublishStatus,
): Promise<void> {
  const response = await fetch(`/api/admin/blogs/${blogId}/publish`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publishStatus }),
  })

  const data = (await response.json().catch(() => ({}))) as ApiErrorResponse

  if (!response.ok) {
    throw new Error(data.error ?? 'Failed to update publish status')
  }
}

export async function deleteAdminBlog(blogId: string): Promise<void> {
  const response = await fetch(`/api/admin/blogs/${blogId}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  const data = (await response.json().catch(() => ({}))) as ApiErrorResponse

  if (!response.ok) {
    throw new Error(data.error ?? 'Failed to delete blog')
  }
}
