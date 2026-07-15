import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { CommitteeList } from '../components/CommitteeList';
import { committeeApi } from '../api/committee.api';
import { useAuth } from '../../../hooks/useAuth';
import type { CommitteeMember } from '../../../types/committee.types';
import { toast } from 'sonner';
import { Skeleton } from '../../../components/ui/Skeleton';

export const CommitteePage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await committeeApi.getMembers();
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load committee members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleEdit = (member: CommitteeMember) => {
    // Basic stub - would normally open a modal
    toast.info(`Editing ${member.name} - functionality stubbed`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal mb-1">Committee Members</h1>
          <p className="text-charcoal-muted">Meet your society's managing committee.</p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => navigate('/committee/assign')}>
            Assign Member
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <CommitteeList members={members} isAdmin={isAdmin} onEdit={handleEdit} />
      )}
    </div>
  );
};
