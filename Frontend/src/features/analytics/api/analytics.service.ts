import { apiClient } from '../../../shared/lib/axios';

export const analyticsService = {
  getAnomalies: async (): Promise<any[]> => { // Added explicit Array return type
    const { data } = await apiClient.get('/anomalies');
    return data;
  },

  // Rename this from getGlobalResults to getResults
  getResults: async (): Promise<any[]> => {
    const { data } = await apiClient.get('/results');
    return data;
  },

  predictEntityRisk: async (type: 'driver' | 'fleet' | 'ops', entities: any[]) => {
    const { data } = await apiClient.post(`/entity/${type}/predict_batch`, { entities });
    return data;
  }
};