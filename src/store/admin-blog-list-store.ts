import { create } from 'zustand'

type AdminBlogListState = {
  search: string
  debouncedSearch: string
  page: number
  setSearch: (search: string) => void
  setDebouncedSearch: (debouncedSearch: string) => void
  setPage: (page: number) => void
  resetPage: () => void
}

export const useAdminBlogListStore = create<AdminBlogListState>((set) => ({
  search: '',
  debouncedSearch: '',
  page: 1,
  setSearch: (search) => set({ search }),
  setDebouncedSearch: (debouncedSearch) => set({ debouncedSearch, page: 1 }),
  setPage: (page) => set({ page }),
  resetPage: () => set({ page: 1 }),
}))
