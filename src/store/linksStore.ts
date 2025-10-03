import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Link } from '../types';

interface LinksState {
  links: Link[];
  selectedLink: Link | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLinks: (links: Link[]) => void;
  addLink: (link: Link) => void;
  updateLink: (id: number, link: Partial<Link>) => void;
  removeLink: (id: number) => void;
  selectLink: (link: Link | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearLinks: () => void;
}

export const useLinksStore = create<LinksState>()(
  devtools(
    persist(
      (set) => ({
        links: [],
        selectedLink: null,
        isLoading: false,
        error: null,

        setLinks: (links) => set({ links }),

        addLink: (link) => set((state) => ({ links: [link, ...state.links] })),

        updateLink: (id, updatedLink) =>
          set((state) => ({
            links: state.links.map((link) =>
              link.id === id ? { ...link, ...updatedLink } : link
            ),
          })),

        removeLink: (id) =>
          set((state) => ({
            links: state.links.filter((link) => link.id !== id),
          })),

        selectLink: (link) => set({ selectedLink: link }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        clearLinks: () => set({ links: [], selectedLink: null }),
      }),
      {
        name: 'links-storage',
        partialize: (state) => ({ links: state.links }),
      }
    ),
    { name: 'LinksStore' }
  )
);
