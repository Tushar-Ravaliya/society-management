import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AssignForm } from '../components/AssignForm';
import { committeeApi } from '../api/committee.api';
import { authApi } from '../../auth/api/auth.api';
import type { AssignCommitteeMemberPayload } from '../../../types/committee.types';
import type { User } from '../../../types/auth.types';
import { Spinner } from '../../../components/ui/Spinner';

export const AssignCommitteePage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await authApi.getUsers();
        if (res.data.success) {
          setUsers(res.data.data.users || []);
        }
      } catch (err) {
        toast.error('Failed to fetch user list');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (data: AssignCommitteeMemberPayload) => {
    try {
      const res = await committeeApi.assign(data);
      if (res.data.success) {
        toast.success('Committee member assigned successfully');
        navigate('/committee');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign member');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal mb-1">Assign Committee Member</h1>
        <p className="text-charcoal-muted">Add a user to the managing committee.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-orchid/10 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Spinner size="lg" />
            <p className="text-charcoal-muted font-body text-sm">Loading registered users...</p>
          </div>
        ) : (
          <AssignForm onSubmit={handleSubmit} users={users} />
        )}
      </div>
    </div>
  );
};
