import { api } from '../../../config/api';
import type { CommitteeMember, AssignCommitteeMemberPayload, UpdateCommitteeMemberPayload } from '../../../types/committee.types';
import type { ApiResponse } from '../../../types/common.types';

export const committeeApi = {
  getMembers: (activeOnly?: boolean) =>
    api.get<ApiResponse<{ committee: CommitteeMember[] }>>('/committee', { params: { activeOnly } }),

  assign: (data: AssignCommitteeMemberPayload) =>
    api.post<ApiResponse<{ committeeMember: CommitteeMember }>>('/committee', data),

  update: (id: string, data: UpdateCommitteeMemberPayload) =>
    api.patch<ApiResponse<{ committeeMember: CommitteeMember }>>(`/committee/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/committee/${id}`),
};
