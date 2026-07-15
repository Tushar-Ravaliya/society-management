import { api } from '../../../config/api';
import type { Unit, CreateUnitPayload } from '../../../types/unit.types';
import type { ApiResponse, PaginationMeta } from '../../../types/common.types';

export const unitsApi = {
  getUnits: (params: { page?: number; limit?: number; block?: string; status?: string }) =>
    api.get<ApiResponse<{ units: Unit[], pagination: PaginationMeta }>>('/units', { params }),

  create: (data: CreateUnitPayload) =>
    api.post<ApiResponse<{ unit: Unit }>>('/units', data),
};
