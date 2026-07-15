import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RaiseRequestForm } from '../components/RaiseRequestForm';
import { serviceRequestsApi } from '../api/service-requests.api';
import type { RaiseServiceRequestPayload } from '../../../types/service-request.types';

export const RaiseRequestPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: RaiseServiceRequestPayload) => {
    try {
      const res = await serviceRequestsApi.raise(data);
      if (res.data.success) {
        toast.success('Service request submitted successfully');
        navigate('/service-requests');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal mb-1">Raise Service Request</h1>
        <p className="text-charcoal-muted">Request permissions, documents, or facilities.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-orchid/10 shadow-sm">
        <RaiseRequestForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};
