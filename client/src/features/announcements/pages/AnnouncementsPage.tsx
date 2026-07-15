import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { Pagination } from '../../../components/data/Pagination';
import { announcementsApi } from '../api/announcements.api';
import { useAuth } from '../../../hooks/useAuth';
import type { Announcement } from '../../../types/announcement.types';
import { toast } from 'sonner';

export const AnnouncementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const canManage = role === 'admin' || role === 'committee';
  
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

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
              canDelete={canManage && (role === 'admin' || announcement.publishedBy.id === user?.id)}
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
    </div>
  );
};
