import type { Link } from '@/types'
import { create } from 'zustand'

interface LinksState {
  links: Link[]
  isLoading: boolean
  error: string | null
  setLinks: (links: Link[]) => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
  addLink: (link: Link) => void
  updateLink: (link: Link) => void
  removeLink: (id: number) => void
}

export const useLinksStore = create<LinksState>()((set) => ({
  links: [],
  isLoading: false,
  error: null,
  setLinks: (links) => set({ links }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addLink: (link) => set((s) => ({ links: [link, ...s.links] })),
  updateLink: (link) => set((s) => ({ links: s.links.map((l) => (l.id === link.id ? link : l)) })),
  removeLink: (id) => set((s) => ({ links: s.links.filter((l) => l.id !== id) })),
}))
