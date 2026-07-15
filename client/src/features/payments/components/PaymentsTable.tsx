import { DataTable } from '../../../components/data/DataTable';
import { Badge } from '../../../components/ui/Badge';
import type { Payment } from '../../../types/payment.types';
import { formatCurrency } from '../../../lib/formatCurrency';
import { formatDateTime } from '../../../lib/formatDate';
import { Button } from '../../../components/ui/Button';

interface PaymentsTableProps {
  payments: Payment[];
  loading?: boolean;
  onVerify?: (payment: Payment) => void;
}

export function PaymentsTable({ payments, loading, onVerify }: PaymentsTableProps) {
  const getStatusBadge = (status: Payment['status']) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success">Verified</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getMethodBadge = (method: Payment['paymentMethod']) => {
    const labels: Record<string, string> = {
      online: 'Online',
      cash: 'Cash',
      bank_transfer: 'Transfer',
      cheque: 'Cheque',
    };
    return <Badge variant="neutral">{labels[method] || method}</Badge>;
  };

  const columns = [
    {
      key: 'billNumber',
      header: 'Bill',
      render: (item: Payment) => (
        <span className="font-medium text-charcoal">{item.billNumber}</span>
      ),
    },
    {
      key: 'residentName',
      header: 'Resident',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item: Payment) => formatCurrency(Number(item.amount)),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (item: Payment) => getMethodBadge(item.paymentMethod),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Payment) => getStatusBadge(item.status),
    },
    {
      key: 'paymentDate',
      header: 'Date',
      render: (item: Payment) => formatDateTime(new Date(item.paymentDate)),
    },
  ];

  if (onVerify) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      render: (item: Payment) => (
        item.status === 'pending' ? (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onVerify(item);
            }}
          >
            Verify
          </Button>
        ) : <span />
      ),
    });
  }

  return (
    <DataTable
      columns={columns}
      data={payments}
      loading={loading}
      emptyMessage="No payments found."
    />
  );
}
