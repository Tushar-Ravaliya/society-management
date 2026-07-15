import { api } from '../../../config/api';

export const reportsApi = {
  getDefaulters: () => api.get('/reports/defaulters'),
};
