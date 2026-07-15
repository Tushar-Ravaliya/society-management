import React from 'react';
import { Link } from 'react-router-dom';
import { ImageIcon } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { formatRelative } from '../../../lib/formatDate';
import type { Complaint } from '../../../types/complaint.types';

interface ComplaintTableProps {
  data: Complaint[];
  isAdminOrCommittee: boolean;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({ data, isAdminOrCommittee }) => {
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'neutral';
      default: return 'neutral';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'assigned': return 'info';
      case 'resolved': return 'success';
      case 'rejected': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-orchid/10 bg-white">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-aura/50 border-b border-orchid/10 text-charcoal-muted font-medium">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            {isAdminOrCommittee && <th className="px-4 py-3">Raised By</th>}
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 text-center">Attachment</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={isAdminOrCommittee ? 7 : 6} className="px-4 py-8 text-center text-charcoal-muted">
                No complaints found.
              </td>
            </tr>
          ) : (
            data.map((complaint, idx) => (
              <tr 
                key={complaint.id} 
                className={`border-b border-orchid/5 hover:bg-aura/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-aura/10'}`}
              >
                <td className="px-4 py-3 font-medium">
                  <Link to={`/complaints/${complaint.id}`} className="text-primary hover:underline">
                    {complaint.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-charcoal">{complaint.category}</td>
                <td className="px-4 py-3">
                  <Badge variant={getPriorityVariant(complaint.priority)}>
                    {complaint.priority}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getStatusVariant(complaint.status)}>
                    {complaint.status}
                  </Badge>
                </td>
                {isAdminOrCommittee && (
                  <td className="px-4 py-3 text-charcoal">{complaint.raisedBy.name}</td>
                )}
                <td className="px-4 py-3 text-charcoal-muted">{formatRelative(complaint.createdAt)}</td>
                <td className="px-4 py-3 flex justify-center">
                  {complaint.imageUrl && <ImageIcon className="w-4 h-4 text-charcoal-muted" />}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
