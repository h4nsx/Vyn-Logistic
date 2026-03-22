import { create } from 'zustand';

interface SearchState {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false }),
  toggleSearch: () => set((state) => ({ isOpen: !state.isOpen })),
}));