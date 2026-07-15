import { api } from '../../../config/api';
import type { Bill, GenerateBatchPayload } from '../../../types/billing.types';
import type { ApiResponse, PaginationMeta } from '../../../types/common.types';

export const billingApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string; billingPeriod?: string }) =>
    api.get<ApiResponse<{ bills: Bill[], pagination: PaginationMeta }>>('/billing', { params }),

  generateBatch: (data: GenerateBatchPayload) =>
    api.post<ApiResponse<{ message: string }>>('/billing/generate-batch', data),

  getUnitBills: (unitId: string, params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ bills: Bill[], pagination: PaginationMeta }>>(`/billing/unit/${unitId}`, { params }),

  getBillById: (id: string) =>
    api.get<ApiResponse<{ bill: Bill }>>(`/billing/bills/${id}`),
};
