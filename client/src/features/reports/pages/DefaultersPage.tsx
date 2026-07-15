import { useEffect, useState } from 'react';
import { reportsApi } from '../api/reports.api';
import { DefaultersTable } from '../components/DefaultersTable';
import { StatCard } from '../../../components/data/StatCard';
import { Users, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../lib/formatCurrency';
import { toast } from 'sonner';

export function DefaultersPage() {
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDefaulters = async () => {
      try {
        const res = await reportsApi.getDefaulters();
        setDefaulters(res.data.data.defaulters || []);
      } catch (error) {
        toast.error('Failed to load defaulters report');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDefaulters();
  }, []);

  const totalOverdue = defaulters.reduce((acc, curr) => acc + Number(curr.overdueAmount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal">Defaulters Report</h1>
        <p className="text-charcoal-muted mt-1">Residents with overdue maintenance bills</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          icon={Users}
          label="Total Defaulters"
          value={defaulters.length}
        />
        <StatCard
          icon={AlertCircle}
          label="Total Overdue Amount"
          value={formatCurrency(totalOverdue)}
        />
      </div>

      <div className="bg-white rounded-xl border border-orchid/10 shadow-[0_8px_30px_rgba(109,40,217,0.04)] overflow-hidden">
        <div className="p-4 border-b border-orchid/10">
          <h2 className="font-display font-semibold text-lg text-charcoal">Defaulters List</h2>
        </div>
        <DefaultersTable data={defaulters} loading={isLoading} />
      </div>
    </div>
  );
}
