export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'assigned' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  imageUrl: string | null;
  resolutionDetails: string | null;
  resolvedAt: string | null;
  createdAt: string;
  raisedBy: { id: string; name: string; email: string };
  assignedTo: { id: string; name: string; email: string } | null;
}

export interface LodgeComplaintPayload {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  image?: File;
}
