import { api } from '../../../config/api';

export const auditApi = {
  getLogs: (params?: { page?: number; limit?: number; module?: string; action?: string }) =>
    api.get('/admin/audit-logs', { params }),
};
