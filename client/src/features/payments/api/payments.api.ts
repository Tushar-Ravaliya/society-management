import { api } from '../../../config/api';
import type { 
  Payment, 
  RecordOfflinePayload, 
  VerifyOnlinePayload, 
  VerifyPaymentPayload 
} from '../../../types/payment.types';
import type { ApiResponse, PaginationMeta } from '../../../types/common.types';

export const paymentsApi = {
  getAll: (params: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<{ payments: Payment[], pagination: PaginationMeta }>>('/payments', { params }),

  recordOffline: (data: RecordOfflinePayload) =>
    api.post<ApiResponse<{ payment: Payment }>>('/payments/offline', data),

  createOnlineOrder: (data: { billId: string }) =>
    api.post<ApiResponse<{ orderId: string, amount: number, currency: string, billNumber: string }>>('/payments/online/order', data),

  verifyOnlinePayment: (data: VerifyOnlinePayload) =>
    api.post<ApiResponse<{ success: boolean }>>('/payments/online/verify', data),

  verifyPayment: (id: string, data: VerifyPaymentPayload) =>
    api.patch<ApiResponse<{ payment: Payment }>>(`/payments/${id}/verify`, data),
};
