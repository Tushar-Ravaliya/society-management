import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { formatRelative, formatDate } from '../../../lib/formatDate';
import { requestTypeLabels } from '../../../types/service-request.types';
import type { ServiceRequest } from '../../../types/service-request.types';

interface RequestTableProps {
  data: ServiceRequest[];
  isAdminOrCommittee: boolean;
}

export const RequestTable: React.FC<RequestTableProps> = ({ data, isAdminOrCommittee }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'completed': return 'info';
      default: return 'neutral';
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-orchid/10 bg-white">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-aura/50 border-b border-orchid/10 text-charcoal-muted font-medium">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            {isAdminOrCommittee && <th className="px-4 py-3">Raised By</th>}
            <th className="px-4 py-3">Preferred Date</th>
            <th className="px-4 py-3">Date Submitted</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={isAdminOrCommittee ? 6 : 5} className="px-4 py-8 text-center text-charcoal-muted">
                No service requests found.
              </td>
            </tr>
          ) : (
            data.map((req, idx) => (
              <tr 
                key={req.id} 
                className={`border-b border-orchid/5 hover:bg-aura/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-aura/10'}`}
              >
                <td className="px-4 py-3 font-medium">
                  <Link to={`/service-requests/${req.id}`} className="text-primary hover:underline">
                    {req.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="info">
                    {requestTypeLabels[req.requestType]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getStatusVariant(req.status)}>
                    {req.status}
                  </Badge>
                </td>
                {isAdminOrCommittee && (
                  <td className="px-4 py-3 text-charcoal">
                    {req.raisedBy.name}
                    {req.raisedBy.flat && <span className="ml-1 text-charcoal-muted">({req.raisedBy.flat})</span>}
                  </td>
                )}
                <td className="px-4 py-3 text-charcoal">
                  {req.preferredDate ? formatDate(req.preferredDate) : <span className="text-charcoal-muted">—</span>}
                </td>
                <td className="px-4 py-3 text-charcoal-muted">{formatRelative(req.createdAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
