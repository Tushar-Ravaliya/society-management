import React from 'react';
import { Edit, Pin, Trash2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { formatRelative } from '../../../lib/formatDate';
import type { Announcement } from '../../../types/announcement.types';

interface AnnouncementCardProps {
  announcement: Announcement;
  canManage: boolean;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, canManage, onEdit, onDelete }) => {
  return (
    <Card 
      hover 
      className={`p-5 relative ${announcement.isPinned ? 'border-l-4 border-l-primary' : ''}`}
    >
      <div className="flex justify-between items-start gap-4 mb-3">
        <h3 className="font-display text-lg font-semibold text-charcoal flex items-center gap-2">
          {announcement.isPinned && <Pin className="w-4 h-4 text-primary" />}
          {announcement.title}
        </h3>
        {canManage && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(announcement)}
              className="text-charcoal-muted hover:text-primary transition-colors p-1"
              title="Edit announcement"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={() => onDelete(announcement.id)}
              className="text-charcoal-muted hover:text-error transition-colors p-1"
              title="Delete announcement"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="text-charcoal text-sm mb-5 whitespace-pre-wrap">
        {announcement.content}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-orchid/10">
        <div className="flex items-center gap-3">
          <Avatar name={announcement.publishedBy.name} size="sm" />
          <div className="text-xs">
            <p className="font-medium text-charcoal">{announcement.publishedBy.name}</p>
            <p className="text-charcoal-muted">{formatRelative(announcement.createdAt)}</p>
          </div>
        </div>
        <div>
          <Badge variant={announcement.audience === 'all' ? 'info' : 'neutral'}>
            Target: {announcement.audience === 'all' ? 'Everyone' : announcement.audience}
          </Badge>
        </div>
      </div>
    </Card>
  );
};
