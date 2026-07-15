import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BillBreakdown } from '../components/BillBreakdown';
import { billingApi } from '../api/billing.api';
import type { Bill } from '../../../types/billing.types';
import { toast } from 'sonner';

export const BillDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await billingApi.getBillById(id);
        if (res.data.success) {
          setBill(res.data.data.bill);
        }
      } catch (err) {
        toast.error('Failed to load bill details');
        navigate('/billing'); // Or my-bills depending on role, but we'll let user use back button
      } finally {
        setLoading(false);
      }
    };
    
    fetchBill();
  }, [id, navigate]);

  if (loading || !bill) {
    return <div className="text-center py-12 text-charcoal-muted">Loading bill details...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline text-sm mb-4 inline-block">
          ← Back
        </button>
      </div>

      <BillBreakdown bill={bill} />
    </div>
  );
};
