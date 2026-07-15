import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AnnouncementForm } from '../components/AnnouncementForm';
import { announcementsApi } from '../api/announcements.api';
import type { CreateAnnouncementPayload } from '../../../types/announcement.types';

export const CreateAnnouncementPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: CreateAnnouncementPayload) => {
    try {
      const res = await announcementsApi.create(data);
      if (res.data.success) {
        toast.success('Announcement published successfully');
        navigate('/announcements');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish announcement');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal mb-1">Create Announcement</h1>
        <p className="text-charcoal-muted">Publish a notice to residents or committee members.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-orchid/10 shadow-sm">
        <AnnouncementForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};
