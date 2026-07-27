'use client'

import { IconSearch } from '@/components/icons'
import { useBlogSearchStore } from '@/store/blog-search-store'
import { useEffect } from 'react'

const DEBOUNCE_MS = 400

export default function BlogSearchBar() {
  const query = useBlogSearchStore((state) => state.query)
  const setQuery = useBlogSearchStore((state) => state.setQuery)
  const setDebouncedQuery = useBlogSearchStore((state) => state.setDebouncedQuery)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [query, setDebouncedQuery])

  return (
    <label className="relative mx-auto block w-full max-w-xl">
      <span className="sr-only">Search blog posts</span>
      <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search blog posts..."
        className="w-full rounded-full border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm text-heading shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-2 focus:ring-zinc-100"
      />
    </label>
  )
}
