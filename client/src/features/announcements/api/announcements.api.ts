import { api } from '../../../config/api';
import type { Announcement, CreateAnnouncementPayload, UpdateAnnouncementPayload } from '../../../types/announcement.types';
import type { ApiResponse, PaginationMeta } from '../../../types/common.types';

export const announcementsApi = {
  getAll: (params: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ announcements: Announcement[], pagination: PaginationMeta }>>('/announcements', { params }),

  create: (data: CreateAnnouncementPayload) =>
    api.post<ApiResponse<{ announcement: Announcement }>>('/announcements', data),

  update: (id: string, data: UpdateAnnouncementPayload) =>
    api.patch<ApiResponse<{ announcement: Announcement }>>(`/announcements/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/announcements/${id}`),
};
