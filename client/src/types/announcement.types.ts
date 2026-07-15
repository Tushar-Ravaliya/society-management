// Placeholder types for announcements
export type AnnouncementAudience = 'all' | 'owners' | 'tenants';

export interface Announcement {
  id: string;
  title: string;
  content: string;
}
