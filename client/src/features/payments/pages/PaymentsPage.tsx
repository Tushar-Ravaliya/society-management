import { useEffect, useState } from 'react';
import { paymentsApi } from '../api/payments.api';
import { PaymentsTable } from '../components/PaymentsTable';
import { VerifyPaymentModal } from '../components/VerifyPaymentModal';
import type { Payment } from '../../../types/payment.types';
import { Pagination } from '../../../components/data/Pagination';
import { Select } from '../../../components/ui/Select';
import { toast } from 'sonner';

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [status, setStatus] = useState<string>('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Modal
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const res = await paymentsApi.getAll({ 
        page, 
        limit,
        ...(status && { status })
      });
      setPayments(res.data.data.payments || []);
      setTotalPages(res.data.data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, status]);

  const handleVerify = async (id: string, data: { status: 'verified' | 'failed', verificationNotes?: string }) => {
    await paymentsApi.verifyPayment(id, data);
    fetchPayments();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Payments</h1>
          <p className="text-charcoal-muted mt-1">Manage and verify resident payments</p>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="w-48">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Pending Verification', value: 'pending' },
              { label: 'Verified', value: 'verified' },
              { label: 'Failed/Rejected', value: 'failed' },
            ]}
          />
        </div>
      </div>

      <PaymentsTable 
        payments={payments} 
        loading={isLoading}
        onVerify={setSelectedPayment}
      />

      {payments.length > 0 && totalPages > 1 && (
        <Pagination 
          page={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      )}

      <VerifyPaymentModal
        open={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        payment={selectedPayment}
        onVerify={handleVerify}
      />
    </div>
  );
}
