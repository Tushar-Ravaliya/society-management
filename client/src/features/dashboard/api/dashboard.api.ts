import { api } from '../../../config/api';
import type { ApiResponse } from '../../../types/common.types';

export interface AdminDashboardData {
  occupancy: { totalUnits: number; occupied: number; vacant: number };
  finances: {
    billingPeriod: string;
    totalBilled: string;
    totalCollected: string;
    collectionRatePercent: number;
  };
  tickets: {
    pendingComplaints: number;
    assignedComplaints: number;
    pendingServiceRequests: number;
  };
}

export interface ResidentDashboardData {
  outstandingBillsCount: number;
  totalDueAmount: string;
  activeTickets: {
    complaints: { id: string; title: string; status: string }[];
    serviceRequests: { id: string; title: string; status: string }[];
  };
  recentAnnouncements: { id: string; title: string; createdAt: string }[];
}

export const dashboardApi = {
  getAdminDashboard: () =>
    api.get<ApiResponse<AdminDashboardData>>('/dashboard/admin'),

  getResidentDashboard: () =>
    api.get<ApiResponse<ResidentDashboardData>>('/dashboard/resident'),
};
