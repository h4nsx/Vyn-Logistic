import { apiClient, mlClient } from '../../../shared/lib/axios';

export const datasetService = {
  validateCsv: async (file: File, onProgress?: (p: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await mlClient.post('/api/validate/integrated_csv', formData, {
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
    const { data } = await mlClient.post('/api/analyze/integrated_csv', formData);
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
  }
};