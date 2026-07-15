import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AssignForm } from '../components/AssignForm';
import { committeeApi } from '../api/committee.api';
import type { AssignCommitteeMemberPayload } from '../../../types/committee.types';

export const AssignCommitteePage: React.FC = () => {
  const navigate = useNavigate();

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
        <AssignForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};
