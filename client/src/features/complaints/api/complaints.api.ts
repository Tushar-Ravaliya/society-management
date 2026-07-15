import { api } from '../../../config/api';
import type { Complaint } from '../../../types/complaint.types';
import type { ApiResponse, PaginationMeta } from '../../../types/common.types';

export const complaintsApi = {
  getAll: (params: { page?: number; limit?: number; status?: string; category?: string; priority?: string }) =>
    api.get<ApiResponse<{ complaints: Complaint[], pagination: PaginationMeta }>>('/complaints', { params }),
    
  getById: (id: string) =>
    api.get<ApiResponse<{ complaint: Complaint }>>(`/complaints/${id}`),

  lodge: (formData: FormData) =>
    api.post<ApiResponse<{ complaint: Complaint }>>('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  assign: (id: string, data: { assignedToId: string }) =>
    api.patch<ApiResponse<{ complaint: Complaint }>>(`/complaints/${id}/assign`, data),

  resolve: (id: string, data: { status: 'resolved' | 'rejected'; resolutionDetails: string }) =>
    api.patch<ApiResponse<{ complaint: Complaint }>>(`/complaints/${id}/resolve`, data),
};
