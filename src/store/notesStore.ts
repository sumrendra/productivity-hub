import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Note } from '../types';

interface NotesState {
  notes: Note[];
  selectedNote: Note | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: number, note: Partial<Note>) => void;
  removeNote: (id: number) => void;
  selectNote: (note: Note | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearNotes: () => void;
}

export const useNotesStore = create<NotesState>()(
  devtools(
    persist(
      (set) => ({
        notes: [],
        selectedNote: null,
        isLoading: false,
        error: null,

        setNotes: (notes) => set({ notes }),
        
        addNote: (note) => 
          set((state) => ({ notes: [note, ...state.notes] })),
        
        updateNote: (id, updatedNote) =>
          set((state) => ({
            notes: state.notes.map((note) =>
              note.id === id ? { ...note, ...updatedNote } : note
            ),
          })),
        
        removeNote: (id) =>
          set((state) => ({
            notes: state.notes.filter((note) => note.id !== id),
          })),
        
        selectNote: (note) => set({ selectedNote: note }),
        
        setLoading: (isLoading) => set({ isLoading }),
        
        setError: (error) => set({ error }),
        
        clearNotes: () => set({ notes: [], selectedNote: null }),
      }),
      {
        name: 'notes-storage',
        partialize: (state) => ({ notes: state.notes }),
      }
    ),
    { name: 'NotesStore' }
  )
);
