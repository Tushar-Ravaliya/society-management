// Placeholder types for complaints
export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved';
export type ComplaintPriority = 'low' | 'medium' | 'high';

export interface Complaint {
  id: string;
  title: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
}
