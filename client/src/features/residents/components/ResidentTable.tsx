import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import type { Resident } from '../../../types/resident.types';

interface ResidentTableProps {
  data: Resident[];
  canManage?: boolean;
  onEdit?: (resident: Resident) => void;
  onDelete?: (resident: Resident) => void;
}

export const ResidentTable: React.FC<ResidentTableProps> = ({ data, canManage, onEdit, onDelete }) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-orchid/10 bg-white">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-aura/50 border-b border-orchid/10 text-charcoal-muted font-medium">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Unit</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Vehicle</th>
            {canManage && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={canManage ? 7 : 6} className="px-4 py-8 text-center text-charcoal-muted">
                No residents found.
              </td>
            </tr>
          ) : (
            data.map((resident, idx) => (
              <tr
                key={resident.id}
                className={`border-b border-orchid/5 hover:bg-aura/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-aura/10'}`}
              >
                <td className="px-4 py-3 font-medium text-charcoal">{resident.name}</td>
                <td className="px-4 py-3 text-charcoal-muted">{resident.email}</td>
                <td className="px-4 py-3 text-charcoal">{resident.phoneNumber || '-'}</td>
                <td className="px-4 py-3 text-charcoal">{resident.unit.block}-{resident.unit.flatNumber}</td>
                <td className="px-4 py-3">
                  <Badge variant={resident.residencyType === 'owner' ? 'info' : 'neutral'}>
                    {resident.residencyType}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-charcoal-muted">{resident.vehicleNumber || '-'}</td>
                {canManage && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit?.(resident)}
                        className="p-1.5 rounded-md text-charcoal-muted hover:text-primary hover:bg-primary-light/40 transition-colors"
                        title="Edit resident"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(resident)}
                        className="p-1.5 rounded-md text-charcoal-muted hover:text-error hover:bg-error/10 transition-colors"
                        title="Delete resident"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
