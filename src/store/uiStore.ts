import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  aiChatOpen: boolean
  commandPaletteOpen: boolean
  toggleSidebar: () => void
  toggleAIChat: () => void
  setCommandPalette: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      aiChatOpen: false,
      commandPaletteOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleAIChat: () => set((s) => ({ aiChatOpen: !s.aiChatOpen })),
      setCommandPalette: (open) => set({ commandPaletteOpen: open }),
    }),
    { name: 'flowspace-ui' }
  )
)
