export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: 'all' | 'residents' | 'committee';
  isPinned: boolean;
  expiresAt: string | null;
  createdAt: string;
  publishedBy: {
    id: string;
    name: string;
  };
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  audience: 'all' | 'residents' | 'committee';
  isPinned?: boolean;
  expiresAt?: string | null;
}

export type UpdateAnnouncementPayload = Partial<CreateAnnouncementPayload>;
