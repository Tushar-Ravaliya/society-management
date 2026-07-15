import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ComplaintForm } from '../components/ComplaintForm';
import { complaintsApi } from '../api/complaints.api';
import type { LodgeComplaintPayload } from '../../../types/complaint.types';

export const LodgeComplaintPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: LodgeComplaintPayload) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('priority', data.priority);
      if (data.image) {
        formData.append('image', data.image);
      }

      const res = await complaintsApi.lodge(formData);
      if (res.data.success) {
        toast.success('Complaint submitted successfully');
        navigate('/complaints');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal mb-1">Lodge Complaint</h1>
        <p className="text-charcoal-muted">Report an issue or concern in the society.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-orchid/10 shadow-sm">
        <ComplaintForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};
