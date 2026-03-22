import { apiClient } from '../../../shared/lib/axios';

export const datasetService = {
  validateCsv: async (file: File, onProgress?: (p: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/validate/integrated_csv', formData, {
      onUploadProgress: (e) => {
        if (onProgress) {
          const progress = Math.round((e.loaded * 100) / (e.total || 100));
          onProgress(progress);
        }
      },
    });
    return data; // Expected: { columns: string[], suggestions?: any }
  },

  analyzeCsv: async (file: File, mapping: Record<string, string>) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    
    const { data } = await apiClient.post('/analyze/integrated_csv', formData);
    return data;
  },

  // This is the function the page needs for history
  getAllUploads: async () => {
    const { data } = await apiClient.get('/uploads');
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/uploads/${id}`);
  },

  getCaseDetail: async (caseId: string) => {
    const { data } = await apiClient.get(`/process/${caseId}`);
    return data;
  },

  uploadCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/upload', formData);
    return data;
  },

  getUploadDetails: async (uploadId: string) => {
    const { data } = await apiClient.get(`/uploads/${uploadId}`);
    return data;
  },

  analyzeProcess: async (events: any) => {
    const { data } = await apiClient.post('/process/analyze', events);
    return data;
  },

  analyzeProcessFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/process/analyze-file', formData);
    return data;
  },

  getIntegratedAnalyses: async () => {
    const { data } = await apiClient.get('/integrated_analyses');
    return data;
  },

  getIntegratedAnalysisDetail: async (analysisId: string) => {
    const { data } = await apiClient.get(`/integrated_analyses/${analysisId}`);
    return data;
  }
};