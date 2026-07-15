import { DataTable } from '../../../components/data/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { formatDateTime } from '../../../lib/formatDate';

interface AuditTableProps {
  logs: any[];
  loading?: boolean;
}

export function AuditTable({ logs, loading }: AuditTableProps) {
  const columns = [
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (item: any) => (
        <span className="text-charcoal whitespace-nowrap">
          {formatDateTime(new Date(item.createdAt))}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (item: any) => (
        <span className="font-medium text-charcoal">
          {item.actor?.name || 'System'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (item: any) => (
        <Badge variant="info">{item.action}</Badge>
      ),
    },
    {
      key: 'module',
      header: 'Module',
      render: (item: any) => (
        <span className="capitalize">{item.module}</span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item: any) => (
        <span className="text-charcoal-muted line-clamp-2 max-w-xs" title={item.description}>
          {item.description}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={logs}
      loading={loading}
      emptyMessage="No audit logs found."
    />
  );
}
