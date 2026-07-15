import { api } from '../../../config/api';
import type { Resident, OnboardResidentPayload, UpdateResidentPayload } from '../../../types/resident.types';
import type { ApiResponse, PaginationMeta } from '../../../types/common.types';

export const residentsApi = {
  getDirectory: (params: { page?: number; limit?: number; search?: string; block?: string; residencyType?: string }) =>
    api.get<ApiResponse<{ residents: Resident[], pagination: PaginationMeta }>>('/residents', { params }),

  onboard: (data: OnboardResidentPayload) =>
    api.post<ApiResponse<{ resident: Resident, message: string }>>('/residents/onboard', data),

  update: (id: string, data: UpdateResidentPayload) =>
    api.patch<ApiResponse<{ resident: Resident }>>(`/residents/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/residents/${id}`),
};
