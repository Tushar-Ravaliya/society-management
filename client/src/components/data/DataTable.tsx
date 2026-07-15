import React from 'react';
import { cn } from '../../lib/cn';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading,
  emptyMessage = "No data available",
  onRowClick,
  className
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn("w-full overflow-hidden rounded-xl border border-orchid/10", className)}>
        <table className="w-full text-left text-sm">
          <thead className="bg-aura border-b border-orchid/10 text-charcoal-muted font-medium">
            <tr>
              {columns.map((col, i) => (
                <th key={col.key || i} className="px-6 py-4">
                  <Skeleton className="h-4 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-orchid/5 last:border-0 even:bg-aura/50">
                {columns.map((col, colIndex) => (
                  <td key={col.key || colIndex} className="px-6 py-4">
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={className}>
        <EmptyState title="No Records" description={emptyMessage} />
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-x-auto rounded-xl border border-orchid/10 bg-white", className)}>
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-aura border-b border-orchid/10 text-charcoal-muted font-medium">
          <tr>
            {columns.map((col, i) => (
              <th key={col.key || i} className="px-6 py-4 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr
              key={item.id || rowIndex}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "border-b border-orchid/5 last:border-0 text-charcoal even:bg-aura/50 transition-colors",
                onRowClick && "cursor-pointer hover:bg-aura"
              )}
            >
              {columns.map((col, colIndex) => (
                <td key={col.key || colIndex} className="px-6 py-4">
                  {col.render ? col.render(item) : String((item as any)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
