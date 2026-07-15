import { useEffect, useState } from 'react';

import { BillsTable } from '../components/BillsTable';
import { billingApi } from '../api/billing.api';
import type { Bill } from '../../../types/billing.types';
import { Pagination } from '../../../components/data/Pagination';
import { useAuth } from '../../../hooks/useAuth';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Receipt } from 'lucide-react';
import { toast } from 'sonner';

// Removed ResidentUser

export function MyBillsPage() {
  const { user } = useAuth();

  
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    // Check if we have the resident's unitId
    // If unitId is not on the user object, we might need to fetch it from resident profile
    // For now, assuming it's available or we fetch via a specific endpoint
    const fetchMyBills = async () => {
      try {
        setIsLoading(true);
        // We'll need a backend endpoint that gets bills for the current resident 
        // without needing to explicitly pass unitId, or we get unitId first.
        // For now, let's assume the user object from auth store includes it
        // Or we use a specific API for "my bills"
        
        // This is a placeholder for the actual logic to get the unitId
        const unitId = (user as any)?.unitId;
        
        if (!unitId) {
          // Alternative: call resident dashboard to get unitId, then fetch bills
          // But ideally backend provides a `/billing/my-bills` endpoint
          // For now, we'll try to fetch using the existing unit endpoint
          toast.error("Unit ID not found. Please contact administrator.");
          setIsLoading(false);
          return;
        }

        const res = await billingApi.getUnitBills(unitId, { page, limit });
        setBills(res.data.data.bills || []);
        setTotalPages(res.data.data.pagination?.totalPages || 1);
      } catch (error) {
        console.error('Failed to fetch bills:', error);
        toast.error('Failed to load your bills');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchMyBills();
    }
  }, [page, user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">My Bills</h1>
          <p className="text-charcoal-muted mt-1">View and pay your maintenance bills</p>
        </div>
      </div>

      <BillsTable 
        data={bills}
      />
      {bills.length > 0 && totalPages > 1 && (
        <Pagination 
          page={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      )}

      {!isLoading && bills.length === 0 && (
        <EmptyState
          title="No Bills Found"
          description="You don't have any maintenance bills yet."
          icon={Receipt}
        />
      )}
    </div>
  );
}
