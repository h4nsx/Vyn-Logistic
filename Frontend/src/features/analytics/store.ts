import { create } from 'zustand';

interface AnalyticsState {
  dateRange: '7d' | '30d' | '90d';
  selectedNode: string | null;
  setDateRange: (range: '7d' | '30d' | '90d') => void;
  setSelectedNode: (node: string | null) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  dateRange: '30d',
  selectedNode: null,
  setDateRange: (range) => set({ dateRange: range }),
  setSelectedNode: (node) => set({ selectedNode: node }),
}));