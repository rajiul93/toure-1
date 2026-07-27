'use client'

import { useAdminBlogListStore } from '@/store/admin-blog-list-store'
import { useEffect } from 'react'

const DEBOUNCE_MS = 400

export default function AdminBlogSearchBar() {
  const search = useAdminBlogListStore((state) => state.search)
  const setSearch = useAdminBlogListStore((state) => state.setSearch)
  const setDebouncedSearch = useAdminBlogListStore((state) => state.setDebouncedSearch)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [search, setDebouncedSearch])

  return (
    <input
      type="search"
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      placeholder="Search by title or slug..."
      className="w-full max-w-md rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  )
}
