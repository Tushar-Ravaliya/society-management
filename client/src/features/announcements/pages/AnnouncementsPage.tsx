import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { Pagination } from '../../../components/data/Pagination';
import { announcementsApi } from '../api/announcements.api';
import { useAuth } from '../../../hooks/useAuth';
import type { Announcement } from '../../../types/announcement.types';
import { toast } from 'sonner';

const toDateTimeInput = (value: string | null) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 16);
};

export const AnnouncementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const canManage = role === 'admin' || role === 'committee';
  
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    audience: 'all' as 'all' | 'residents' | 'committee',
    isPinned: false,
    expiresAt: '',
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await announcementsApi.getAll({ page, limit });
      if (res.data.success) {
        setData(res.data.data.announcements || []);
        setTotal(res.data.data.pagination?.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [page]);

  const canManageAnnouncement = (announcement: Announcement) =>
    canManage && (role === 'admin' || announcement.publishedBy.id === user?.id);

  const openEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setEditForm({
      title: announcement.title,
      content: announcement.content,
      audience: announcement.audience,
      isPinned: announcement.isPinned,
      expiresAt: toDateTimeInput(announcement.expiresAt),
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;

    setSaving(true);
    try {
      const res = await announcementsApi.update(editingAnnouncement.id, {
        title: editForm.title,
        content: editForm.content,
        audience: editForm.audience,
        isPinned: editForm.isPinned,
        expiresAt: editForm.expiresAt ? new Date(editForm.expiresAt).toISOString() : null,
      });

      if (res.data.success) {
        toast.success('Announcement updated');
        setEditingAnnouncement(null);
        fetchAnnouncements();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement? This cannot be undone.')) {
      try {
        const res = await announcementsApi.delete(id);
        if (res.data.success) {
          toast.success('Announcement deleted');
          fetchAnnouncements();
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to delete announcement');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal mb-1">Announcements</h1>
          <p className="text-charcoal-muted">Stay updated with society notices and news.</p>
        </div>
        {canManage && (
          <Button variant="primary" onClick={() => navigate('/announcements/new')}>
            Create Announcement
          </Button>
        )}
      </div>

      <div className={`space-y-4 ${loading ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}`}>
        {data.length === 0 && !loading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-orchid/10">
            <p className="text-charcoal-muted">No announcements available.</p>
          </div>
        ) : (
          data.map(announcement => (
            <AnnouncementCard 
              key={announcement.id} 
              announcement={announcement} 
              canManage={canManageAnnouncement(announcement)}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {total > 0 && (
        <Pagination 
          page={page} 
          totalPages={Math.ceil(total / limit)} 
          onPageChange={setPage} 
        />
      )}

      <Modal open={!!editingAnnouncement} onClose={() => setEditingAnnouncement(null)} title="Edit Announcement" size="lg">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Title"
            value={editForm.title}
            onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <Textarea
            label="Content"
            rows={5}
            value={editForm.content}
            onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
            required
          />
          <Select
            label="Audience"
            value={editForm.audience}
            onChange={(e) => setEditForm((prev) => ({ ...prev, audience: e.target.value as 'all' | 'residents' | 'committee' }))}
            options={[
              { value: 'all', label: 'Everyone' },
              { value: 'residents', label: 'Residents' },
              { value: 'committee', label: 'Committee' },
            ]}
          />
          <Input
            label="Expires At"
            type="datetime-local"
            value={editForm.expiresAt}
            onChange={(e) => setEditForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
          />
          <label className="flex items-center gap-3 text-sm font-medium text-charcoal">
            <input
              type="checkbox"
              checked={editForm.isPinned}
              onChange={(e) => setEditForm((prev) => ({ ...prev, isPinned: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            Pin announcement
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditingAnnouncement(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
