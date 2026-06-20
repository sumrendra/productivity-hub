import type { Note } from '@/types'
import { create } from 'zustand'

interface NotesState {
  notes: Note[]
  selectedNoteId: number | null
  isLoading: boolean
  error: string | null
  setNotes: (notes: Note[]) => void
  setSelectedNoteId: (id: number | null) => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
  addNote: (note: Note) => void
  updateNote: (note: Note) => void
  removeNote: (id: number) => void
}

export const useNotesStore = create<NotesState>()((set) => ({
  notes: [],
  selectedNoteId: null,
  isLoading: false,
  error: null,
  setNotes: (notes) => set({ notes }),
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
  updateNote: (note) => set((s) => ({ notes: s.notes.map((n) => (n.id === note.id ? note : n)) })),
  removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
}))
