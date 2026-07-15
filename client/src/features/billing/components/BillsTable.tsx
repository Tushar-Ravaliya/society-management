import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { formatCurrency } from '../../../lib/formatCurrency';
import { formatDate } from '../../../lib/formatDate';
import type { Bill } from '../../../types/billing.types';

interface BillsTableProps {
  data: Bill[];
  showUnit?: boolean;
}

export const BillsTable: React.FC<BillsTableProps> = ({ data, showUnit = true }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'unpaid': return 'warning';
      case 'overdue': return 'danger';
      case 'partially_paid': return 'info';
      default: return 'neutral';
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-orchid/10 bg-white">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-aura/50 border-b border-orchid/10 text-charcoal-muted font-medium">
          <tr>
            <th className="px-4 py-3">Bill Number</th>
            {showUnit && <th className="px-4 py-3">Unit</th>}
            <th className="px-4 py-3">Period</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Due Date</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={showUnit ? 6 : 5} className="px-4 py-8 text-center text-charcoal-muted">
                No bills found.
              </td>
            </tr>
          ) : (
            data.map((bill, idx) => (
              <tr 
                key={bill.id} 
                className={`border-b border-orchid/5 hover:bg-aura/30 transition-colors ${
                  bill.status === 'unpaid' || bill.status === 'overdue' 
                    ? 'bg-error/5' 
                    : idx % 2 === 0 ? 'bg-white' : 'bg-aura/10'
                }`}
              >
                <td className="px-4 py-3 font-medium">
                  <Link to={`/billing/${bill.id}`} className="text-primary hover:underline">
                    {bill.billNumber}
                  </Link>
                </td>
                {showUnit && (
                  <td className="px-4 py-3 text-charcoal">
                    {bill.unit?.block}-{bill.unit?.flatNumber}
                  </td>
                )}
                <td className="px-4 py-3 text-charcoal">{bill.billingPeriod}</td>
                <td className="px-4 py-3 font-semibold text-charcoal">
                  {formatCurrency(Number(bill.totalAmount))}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getStatusVariant(bill.status)}>
                    {bill.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-charcoal-muted">
                  {formatDate(bill.dueDate)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
