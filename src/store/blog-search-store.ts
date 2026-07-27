import { create } from 'zustand'

type BlogSearchState = {
  query: string
  debouncedQuery: string
  setQuery: (query: string) => void
  setDebouncedQuery: (debouncedQuery: string) => void
}

export const useBlogSearchStore = create<BlogSearchState>((set) => ({
  query: '',
  debouncedQuery: '',
  setQuery: (query) => set({ query }),
  setDebouncedQuery: (debouncedQuery) => set({ debouncedQuery }),
}))
