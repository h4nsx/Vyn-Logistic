import { apiClient, mlClient } from '../../../shared/lib/axios';

export const datasetService = {
   validateCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    // POST to VITE_API_ML_URL/validate/integrated_csv
    const { data } = await mlClient.post('/validate/integrated_csv', formData);
    return data; // Expected: { columns: string[], suggestions?: any }
  },

  // 2. Final Upload to Main Backend
  uploadAndAnalyze: async (file: File, mapping: Record<string, string>) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    
    const { data } = await apiClient.post('/upload', formData);
    return data;
  },

  upload: async (file: File, onProgress: (p: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/upload', formData, {
      onUploadProgress: (e) => {
        const progress = Math.round((e.loaded * 100) / (e.total || 100));
        onProgress(progress);
      },
    });
    return data;
  },

  // This is the function the page needs
  getAllUploads: async () => {
    const { data } = await apiClient.get('/uploads');
    return data;
  },

  // Add the missing delete method
  delete: async (id: string) => {
    // Assuming the endpoint is /uploads/{id} or similar
    await apiClient.delete(`/uploads/${id}`);
  },

  getCaseDetail: async (caseId: string) => {
    const { data } = await apiClient.get(`/process/${caseId}`);
    return data;
  }
};