// Placeholder types for service requests
export type RequestType = 'plumbing' | 'electrical' | 'carpentry' | 'other';

export interface ServiceRequest {
  id: string;
  type: RequestType;
  description: string;
}
