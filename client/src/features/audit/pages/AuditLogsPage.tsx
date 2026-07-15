import React, { useEffect, useState } from 'react';
import { auditApi } from '../api/audit.api';
import { AuditTable } from '../components/AuditTable';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/data/Pagination';
import { toast } from 'sonner';

export function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const res = await auditApi.getLogs({
          page,
          limit,
          ...(moduleFilter && { module: moduleFilter }),
          ...(actionFilter && { action: actionFilter }),
        });
        setLogs(res.data.data.logs || []);
        setTotalPages(res.data.data.pagination?.totalPages || 1);
      } catch (error) {
        toast.error('Failed to load audit logs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [page, moduleFilter, actionFilter]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setPage(1); // Reset to page 1 on filter change
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal">Audit Logs</h1>
        <p className="text-charcoal-muted mt-1">System activity and security log</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="w-full sm:w-48">
          <Select
            value={moduleFilter}
            onChange={handleFilterChange(setModuleFilter)}
            options={[
              { label: 'All Modules', value: '' },
              { label: 'Auth', value: 'auth' },
              { label: 'Billing', value: 'billing' },
              { label: 'Payments', value: 'payments' },
              { label: 'Complaints', value: 'complaints' },
              { label: 'Service Requests', value: 'service-requests' },
              { label: 'Committee', value: 'committee' },
              { label: 'Residents', value: 'residents' },
            ]}
          />
        </div>
        <div className="w-full sm:w-48">
          {/* Typically you'd fetch available actions or hardcode common ones */}
          <Select
            value={actionFilter}
            onChange={handleFilterChange(setActionFilter)}
            options={[
              { label: 'All Actions', value: '' },
              { label: 'Created', value: 'CREATED' },
              { label: 'Updated', value: 'UPDATED' },
              { label: 'Deleted', value: 'DELETED' },
              { label: 'Bill Generated', value: 'BILL_GENERATED' },
              { label: 'Payment Verified', value: 'PAYMENT_VERIFIED' },
              { label: 'Login', value: 'LOGIN' },
            ]}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-orchid/10 shadow-[0_8px_30px_rgba(109,40,217,0.04)] overflow-hidden">
        <AuditTable logs={logs} loading={isLoading} />
      </div>

      {logs.length > 0 && totalPages > 1 && (
        <Pagination 
          page={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      )}
    </div>
  );
}
