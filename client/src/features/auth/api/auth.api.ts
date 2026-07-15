import { api } from "../../../config/api";
import type { LoginPayload, RegisterPayload, User } from "../../../types/auth.types";
import type { ApiResponse } from "../../../types/common.types";

export const authApi = {
  login: (data: LoginPayload) =>
    api.post<ApiResponse<{ user: User }>>("/auth/login", data),

  register: (data: RegisterPayload) =>
    api.post<ApiResponse<{ user: User }>>("/auth/register", data),

  refresh: () => api.post<ApiResponse<{ user: User }>>("/auth/refresh"),

  logout: () => api.post<ApiResponse<{ message: string }>>("/auth/logout"),

  me: () => api.get<ApiResponse<{ user: User }>>("/auth/me"),

  getUsers: () => api.get<ApiResponse<{ users: User[] }>>("/auth/users"),
};
