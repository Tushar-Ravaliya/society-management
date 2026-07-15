export interface CommitteeMember {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  designation: string;
  portfolio: string;
  termStart: string;
  termEnd: string;
  isActive: boolean;
}

export interface AssignCommitteeMemberPayload {
  userId: string;
  designation: string;
  portfolio: string;
  termStart: string;
  termEnd: string;
}

export interface UpdateCommitteeMemberPayload {
  designation?: string;
  portfolio?: string;
  isActive?: boolean;
}
