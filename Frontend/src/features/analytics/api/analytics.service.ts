import { apiClient } from '../../../shared/lib/axios';

export const analyticsService = {
  getAnomalies: async (): Promise<any> => {
    const { data } = await apiClient.get('/anomalies');
    return data;
  },

  getResults: async (): Promise<any> => {
    const { data } = await apiClient.get('/results');
    return data;
  },

  predictEntityRisk: async (type: 'driver' | 'fleet' | 'ops', entities: any[]) => {
    const { data } = await apiClient.post(`/entity/${type}/predict_batch`, { entities });
    return data;
  },

  predictEntityRiskSingle: async (type: 'driver' | 'fleet' | 'ops', entity: any) => {
    const { data } = await apiClient.post(`/entity/${type}/predict`, entity);
    return data;
  },

  getEntityResults: async (): Promise<any[]> => {
    const { data } = await apiClient.get('/entity/results');
    return data;
  }
};