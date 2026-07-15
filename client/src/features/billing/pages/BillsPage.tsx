import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Pagination } from '../../../components/data/Pagination';
import { BillsTable } from '../components/BillsTable';
import { billingApi } from '../api/billing.api';
import type { Bill } from '../../../types/billing.types';
import { toast } from 'sonner';

export const BillsPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [status, setStatus] = useState<string>('');
  const [billingPeriod, setBillingPeriod] = useState<string>('');

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await billingApi.getAll({ 
        page, 
        limit, 
        status: status || undefined,
        billingPeriod: billingPeriod || undefined,
      });
      
      if (res.data.success) {
        setData(res.data.data.bills || []);
        setTotal(res.data.data.pagination?.total || 0);
      }
    } catch (err: any) {
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [page, status, billingPeriod]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal mb-1">Maintenance Bills</h1>
          <p className="text-charcoal-muted">Manage society maintenance bills and dues.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/billing/generate')}>
          Generate Bills
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-orchid/10 shadow-sm">
        <div className="w-full md:w-48">
          <Select 
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'paid', label: 'Paid' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'partially_paid', label: 'Partially Paid' },
            ]}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-full md:w-48">
          <Input 
            placeholder="Period (e.g. Jul 2025)" 
            value={billingPeriod}
            onChange={(e) => { setBillingPeriod(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className={loading ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
        <BillsTable data={data} showUnit={true} />
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
