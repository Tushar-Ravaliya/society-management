export type ServiceRequestType = 'noc' | 'clubhouse_booking' | 'renovation_permission' | 'parking_allocation' | 'other';
export type ServiceRequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  requestType: ServiceRequestType;
  status: ServiceRequestStatus;
  preferredDate: string | null;
  adminRemarks: string | null;
  completedAt: string | null;
  createdAt: string;
  raisedBy: {
    id: string;
    name: string;
    flat: string | null;
  };
}

export interface RaiseServiceRequestPayload {
  title: string;
  description: string;
  requestType: ServiceRequestType;
  preferredDate?: string | null;
}

export interface ProcessServiceRequestPayload {
  status: ServiceRequestStatus;
  adminRemarks?: string | null;
}

export const requestTypeLabels: Record<ServiceRequestType, string> = {
  noc: 'NOC',
  clubhouse_booking: 'Clubhouse Booking',
  renovation_permission: 'Renovation Permission',
  parking_allocation: 'Parking Allocation',
  other: 'Other',
};
