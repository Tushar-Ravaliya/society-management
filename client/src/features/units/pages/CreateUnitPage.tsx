import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CreateUnitForm } from '../components/CreateUnitForm';
import { unitsApi } from '../api/units.api';
import type { CreateUnitPayload } from '../../../types/unit.types';

export const CreateUnitPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: CreateUnitPayload) => {
    try {
      const res = await unitsApi.create(data);
      if (res.data.success) {
        toast.success('Unit created successfully');
        navigate('/units');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create unit');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal mb-1">Create New Unit</h1>
        <p className="text-charcoal-muted">Add a new flat or unit to the society.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-orchid/10 shadow-sm">
        <CreateUnitForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};
