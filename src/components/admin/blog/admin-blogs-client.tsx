'use client'

import AdminBlogSearchBar from '@/components/admin/blog/admin-blog-search-bar'
import {
  ADMIN_BLOG_LIST_QUERY_KEY,
  adminBlogListQueryKey,
  deleteAdminBlog,
  fetchAdminBlogs,
  toggleAdminBlogPublishStatus,
  type AdminBlogListItem,
  type AdminBlogListResponse,
} from '@/lib/admin-blog-list-api'
import { formatAdminDateTime, formatBlogDisplayDate } from '@/lib/dayjs'
import { useAdminBlogListStore } from '@/store/admin-blog-list-store'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { FaPen, FaPlus, FaTrash } from 'react-icons/fa6'

const PAGE_SIZE = 10

function PublishToggle({
  blog,
  disabled,
  onToggle,
}: {
  blog: AdminBlogListItem
  disabled: boolean
  onToggle: (blog: AdminBlogListItem) => void
}) {
  const isPublished = blog.publishStatus === 'publish'

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(blog)}
      className={[
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-60',
        isPublished ? 'bg-emerald-500' : 'bg-zinc-300',
      ].join(' ')}
      aria-label={isPublished ? 'Unpublish blog' : 'Publish blog'}
      title={isPublished ? 'Published — click to draft' : 'Draft — click to publish'}
    >
      <span
        className={[
          'inline-block size-5 rounded-full bg-white shadow transition',
          isPublished ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  )
}

export default function AdminBlogsClient() {
  const queryClient = useQueryClient()
  const page = useAdminBlogListStore((state) => state.page)
  const debouncedSearch = useAdminBlogListStore((state) => state.debouncedSearch)
  const setPage = useAdminBlogListStore((state) => state.setPage)
  const [actionId, setActionId] = useState<string | null>(null)

  const queryKey = adminBlogListQueryKey(page, debouncedSearch)

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminBlogs({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    placeholderData: (previousData) => previousData,
  })

  const blogs = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0
  const showInitialLoading = isLoading && blogs.length === 0

  const togglePublishMutation = useMutation({
    mutationFn: ({
      blogId,
      publishStatus,
    }: {
      blogId: string
      publishStatus: 'draft' | 'publish'
    }) => toggleAdminBlogPublishStatus(blogId, publishStatus),
    onMutate: async ({ blogId, publishStatus }) => {
      setActionId(blogId)
      await queryClient.cancelQueries({ queryKey: [ADMIN_BLOG_LIST_QUERY_KEY] })

      const previousEntries = queryClient.getQueriesData<AdminBlogListResponse>({
        queryKey: [ADMIN_BLOG_LIST_QUERY_KEY],
      })

      queryClient.setQueryData<AdminBlogListResponse>(queryKey, (current) => {
        if (!current) return current

        return {
          ...current,
          items: current.items.map((item) =>
            item.id === blogId ? { ...item, publishStatus } : item,
          ),
        }
      })

      return { previousEntries }
    },
    onError: (_error, _variables, context) => {
      context?.previousEntries.forEach(([key, value]) => {
        queryClient.setQueryData(key, value)
      })
      window.alert('Failed to update publish status')
    },
    onSettled: () => {
      setActionId(null)
      void queryClient.invalidateQueries({ queryKey: [ADMIN_BLOG_LIST_QUERY_KEY] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (blogId: string) => deleteAdminBlog(blogId),
    onMutate: (blogId) => {
      setActionId(blogId)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_BLOG_LIST_QUERY_KEY] })
    },
    onError: () => {
      window.alert('Failed to delete blog')
    },
    onSettled: () => {
      setActionId(null)
    },
  })

  function handleTogglePublish(blog: AdminBlogListItem) {
    const nextStatus = blog.publishStatus === 'publish' ? 'draft' : 'publish'
    togglePublishMutation.mutate({ blogId: blog.id, publishStatus: nextStatus })
  }

  function handleDelete(blog: AdminBlogListItem) {
    const confirmed = window.confirm(`Delete "${blog.title}"? This will hide the blog from lists.`)
    if (!confirmed) return

    deleteMutation.mutate(blog.id)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Blogs</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage blog posts, publish status, and featured content.
          </p>
        </div>

        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-heading px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-heading/90"
        >
          <FaPlus className="size-3.5" aria-hidden="true" />
          Create
        </Link>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 px-4 py-4 sm:px-6">
          <AdminBlogSearchBar />
        </div>

        {error ? (
          <div className="px-6 py-10 text-center text-sm text-red-600">
            {error instanceof Error ? error.message : 'Failed to load blogs'}
          </div>
        ) : showInitialLoading ? (
          <div className="px-6 py-16 text-center text-sm text-zinc-500">Loading blogs...</div>
        ) : blogs.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-zinc-500">
            No blogs found. Create your first post to get started.
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            {isFetching && !isLoading ? (
              <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-zinc-100">
                <div className="h-full w-1/3 animate-pulse bg-primary/60" />
              </div>
            ) : null}

            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 sm:px-6">Thumbnail</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Publish date</th>
                  <th className="px-4 py-3">Published</th>
                  <th className="px-4 py-3 sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {blogs.map((blog) => {
                  const isBusy = actionId === blog.id

                  return (
                    <tr key={blog.id} className="align-middle">
                      <td className="px-4 py-4 sm:px-6">
                        <div className="relative size-14 overflow-hidden rounded-xl bg-zinc-100">
                          {blog.thumbnailUrl ? (
                            <Image
                              src={blog.thumbnailUrl}
                              alt={blog.thumbnailAlt || blog.title}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-[10px] font-semibold uppercase text-zinc-400">
                              No img
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="max-w-xs font-semibold text-heading sm:max-w-md">{blog.title}</p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-zinc-600">
                        {formatAdminDateTime(blog.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-zinc-600">
                        {formatBlogDisplayDate(blog.publishDate)}
                      </td>
                      <td className="px-4 py-4">
                        <PublishToggle
                          blog={blog}
                          disabled={isBusy}
                          onToggle={handleTogglePublish}
                        />
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/blogs/${blog.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-heading transition hover:bg-zinc-50"
                          >
                            <FaPen className="size-3" aria-hidden="true" />
                            Edit
                          </Link>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDelete(blog)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <FaTrash className="size-3" aria-hidden="true" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!showInitialLoading && totalPages > 1 ? (
          <div className="flex flex-col gap-3 border-t border-zinc-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-zinc-500">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage(Math.max(1, page - 1))}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold text-heading transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold text-heading transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
