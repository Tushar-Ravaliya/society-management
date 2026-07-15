import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { OnboardForm } from '../components/OnboardForm';
import { residentsApi } from '../api/residents.api';
import type { OnboardResidentPayload } from '../../../types/resident.types';

export const OnboardResidentPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: OnboardResidentPayload) => {
    try {
      const res = await residentsApi.onboard(data);
      if (res.data.success) {
        toast.success(res.data.data.message || 'Resident onboarded successfully');
        navigate('/residents');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to onboard resident');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal mb-1">Onboard Resident</h1>
        <p className="text-charcoal-muted">Register a new owner or tenant into the system.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-orchid/10 shadow-sm">
        <OnboardForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};
