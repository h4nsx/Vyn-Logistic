import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Updated steps to include the 'mapping' phase
export type WorkflowStep = 'upload' | 'mapping' | 'processing' | 'completed';

interface ValidationData {
  columns: string[];
  suggestions?: Record<string, string>;
}

interface DatasetState {
  // Data State
  currentDatasetId: string | null;
  activeStep: WorkflowStep;
  uploadProgress: number;
  activeFile: File | null; // The actual CSV file
  validationData: ValidationData | null; // Columns returned by ML service
  
  // Actions
  setCurrentDataset: (id: string | null) => void;
  setStep: (step: WorkflowStep) => void;
  setUploadProgress: (progress: number) => void;
  setActiveFile: (file: File | null) => void;
  setValidationData: (data: ValidationData | null) => void;
  
  // Reset
  resetWorkflow: () => void;
}

export const useDatasetStore = create<DatasetState>()(
  persist(
    (set) => ({
      currentDatasetId: null,
      activeStep: 'upload',
      uploadProgress: 0,
      activeFile: null,
      validationData: null,

      setCurrentDataset: (id) => set({ currentDatasetId: id }),
      
      setStep: (step) => set({ activeStep: step }),
      
      setUploadProgress: (progress) => set({ uploadProgress: progress }),
      
      setActiveFile: (file) => set({ activeFile: file }),
      
      setValidationData: (data) => set({ validationData: data }),

      resetWorkflow: () => set({ 
        currentDatasetId: null, 
        activeStep: 'upload', 
        uploadProgress: 0,
        activeFile: null,
        validationData: null
      }),
    }),
    {
      name: 'vyn-dataset-flow',
      storage: createJSONStorage(() => localStorage),
      // partialize allows us to EXCLUDE the 'activeFile' from localStorage
      // because File objects cannot be turned into JSON strings.
      partialize: (state) => ({
        currentDatasetId: state.currentDatasetId,
        activeStep: state.activeStep,
        uploadProgress: state.uploadProgress,
        validationData: state.validationData,
      }),
    }
  )
);