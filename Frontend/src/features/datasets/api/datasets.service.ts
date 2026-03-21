import { apiClient } from '../../../shared/lib/axios';

export const datasetService = {
  // 1. Upload
  upload: async (file: File, onProgress: (p: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/datasets/upload', formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
        onProgress(percentCompleted);
      },
    });
    return data; // Returns { id, columns }
  },

  // 2. Confirm Mapping
  confirmMapping: async (id: string, mapping: Record<string, string>) => {
    const { data } = await apiClient.post(`/datasets/${id}/map`, { mapping });
    return data; // Returns { suggestedWorkflow }
  },

  // 3. Confirm Workflow
  confirmWorkflow: async (id: string, workflowType: string) => {
    const { data } = await apiClient.post(`/datasets/${id}/workflow`, { workflowType });
    return data;
  },

  // 4. Trigger Analysis
  startAnalysis: async (id: string) => {
    const { data } = await apiClient.post(`/datasets/${id}/analyze`);
    return data;
  },

  // 5. Get Results
  getResults: async (id: string) => {
    const { data } = await apiClient.get(`/datasets/${id}/results`);
    return data;
  },

  getAll: async () => {
    try {
      const { data } = await apiClient.get('/datasets');
      return data;
    } catch (error) {
      // Mock Fallback for UI development
      return [
        { id: 'ds-1', name: 'Q1_Trucking_Data.csv', status: 'Analyzed', rows: 12400, createdAt: '2024-03-10T10:00:00Z', riskScore: 24 },
        { id: 'ds-2', name: 'Warehouse_LHR_March.csv', status: 'Processing', rows: 8500, createdAt: '2024-03-12T14:30:00Z', riskScore: null },
        { id: 'ds-3', name: 'Customs_Entry_Logs.csv', status: 'Failed', rows: 420, createdAt: '2024-03-13T09:15:00Z', riskScore: null },
      ];
    }
  },

  delete: async (id: string) => {
    await apiClient.delete(`/datasets/${id}`);
  }
};