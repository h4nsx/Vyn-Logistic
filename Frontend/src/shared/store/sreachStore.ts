import { create } from 'zustand';

interface SearchState {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false }),
}));