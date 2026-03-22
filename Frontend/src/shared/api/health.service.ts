import { apiClient } from '../lib/axios';

export const healthService = {
  getRoot: async () => {
    const { data } = await apiClient.get('/');
    return data;
  },

  getHealth: async () => {
    const { data } = await apiClient.get('/health');
    return data;
  }
};
