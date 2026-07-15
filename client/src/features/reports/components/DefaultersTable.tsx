import { DataTable } from '../../../components/data/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { formatCurrency } from '../../../lib/formatCurrency';

interface DefaultersTableProps {
  data: any[];
  loading?: boolean;
}

export function DefaultersTable({ data, loading }: DefaultersTableProps) {
  const columns = [
    {
      key: 'flat',
      header: 'Flat',
      render: (item: any) => <span className="font-medium text-charcoal">{item.flat}</span>,
    },
    {
      key: 'residentName',
      header: 'Resident',
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'overdueAmount',
      header: 'Overdue Amount',
      render: (item: any) => (
        <span className="font-semibold text-error">
          {formatCurrency(Number(item.overdueAmount))}
        </span>
      ),
    },
    {
      key: 'missedPeriods',
      header: 'Missed Periods',
      render: (item: any) => (
        <div className="flex flex-wrap gap-1">
          {item.missedPeriods.map((period: string) => (
            <Badge key={period} variant="danger">{period}</Badge>
          ))}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      emptyMessage="No defaulters found. All bills are up to date! 🎉"
    />
  );
}
