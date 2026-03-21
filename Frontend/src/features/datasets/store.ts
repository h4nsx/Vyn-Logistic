import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WorkflowStep = 'upload' | 'mapping' | 'detection' | 'processing' | 'completed';

interface DatasetState {
  currentDatasetId: string | null;
  activeStep: WorkflowStep;
  uploadProgress: number;
  
  // Actions
  setCurrentDataset: (id: string) => void;
  setStep: (step: WorkflowStep) => void;
  setUploadProgress: (progress: number) => void;
  resetWorkflow: () => void;
}

export const useDatasetStore = create<DatasetState>()(
  persist(
    (set) => ({
      currentDatasetId: null,
      activeStep: 'upload',
      uploadProgress: 0,

      setCurrentDataset: (id) => set({ currentDatasetId: id }),
      setStep: (step) => set({ activeStep: step }),
      setUploadProgress: (progress) => set({ uploadProgress: progress }),
      resetWorkflow: () => set({ currentDatasetId: null, activeStep: 'upload', uploadProgress: 0 }),
    }),
    { name: 'vyn-dataset-flow' }
  )
);