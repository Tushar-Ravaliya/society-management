import { api } from '../../../config/api';
import type { 
  ServiceRequest, 
  RaiseServiceRequestPayload, 
  ProcessServiceRequestPayload 
} from '../../../types/service-request.types';
import type { ApiResponse, PaginationMeta } from '../../../types/common.types';

export const serviceRequestsApi = {
  getAll: (params: { page?: number; limit?: number; status?: string; type?: string }) =>
    api.get<ApiResponse<{ serviceRequests: ServiceRequest[], pagination: PaginationMeta }>>('/service-requests', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<{ serviceRequest: ServiceRequest }>>(`/service-requests/${id}`),

  raise: (data: RaiseServiceRequestPayload) =>
    api.post<ApiResponse<{ serviceRequest: ServiceRequest }>>('/service-requests', data),

  process: (id: string, data: ProcessServiceRequestPayload) =>
    api.patch<ApiResponse<{ serviceRequest: ServiceRequest }>>(`/service-requests/${id}`, data),
};
