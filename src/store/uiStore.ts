import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type ColorMode = 'light' | 'dark';

interface UIState {
  colorMode: ColorMode;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeModal: string | null;
  modalData: unknown;

  // Actions
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (modalId: string, data?: unknown) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        colorMode: 'light',
        sidebarOpen: true,
        sidebarCollapsed: false,
        activeModal: null,
        modalData: null,

        toggleColorMode: () =>
          set((state) => ({
            colorMode: state.colorMode === 'light' ? 'dark' : 'light',
          })),

        setColorMode: (mode) => set({ colorMode: mode }),

        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        setSidebarOpen: (open) => set({ sidebarOpen: open }),

        toggleSidebarCollapse: () =>
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

        openModal: (modalId, data = null) =>
          set({ activeModal: modalId, modalData: data }),

        closeModal: () => set({ activeModal: null, modalData: null }),
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({
          colorMode: state.colorMode,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);
