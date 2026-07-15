import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenerateBillsForm } from '../components/GenerateBillsForm';
import { billingApi } from '../api/billing.api';
import type { GenerateBatchPayload } from '../../../types/billing.types';
import { toast } from 'sonner';

export function GenerateBillsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: GenerateBatchPayload) => {
    try {
      setIsLoading(true);
      const res = await billingApi.generateBatch(data);
      const resData = res.data.data as any;
      toast.success(resData.message || `Generated bills for ${data.billingPeriod}`);
      navigate('/billing');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate bills');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal">Generate Batch Bills</h1>
        <p className="text-charcoal-muted mt-1">
          Generate maintenance bills for all occupied units for a specific period.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-orchid/10 shadow-[0_8px_30px_rgba(109,40,217,0.04)]">
        <GenerateBillsForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
