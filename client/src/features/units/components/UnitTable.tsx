import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import type { Unit } from '../../../types/unit.types';

interface UnitTableProps {
  data: Unit[];
}

export const UnitTable: React.FC<UnitTableProps> = ({ data }) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-orchid/10 bg-white">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-aura/50 border-b border-orchid/10 text-charcoal-muted font-medium">
          <tr>
            <th className="px-4 py-3">Block</th>
            <th className="px-4 py-3">Flat Number</th>
            <th className="px-4 py-3">Floor</th>
            <th className="px-4 py-3">BHK Type</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-charcoal-muted">
                No units found.
              </td>
            </tr>
          ) : (
            data.map((unit, idx) => (
              <tr 
                key={unit.id} 
                className={`border-b border-orchid/5 hover:bg-aura/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-aura/10'}`}
              >
                <td className="px-4 py-3 font-medium text-charcoal">{unit.block}</td>
                <td className="px-4 py-3 text-charcoal">{unit.flatNumber}</td>
                <td className="px-4 py-3 text-charcoal">{unit.floor}</td>
                <td className="px-4 py-3 text-charcoal">{unit.bhkType}</td>
                <td className="px-4 py-3">
                  <Badge variant={unit.status === 'occupied' ? 'success' : 'neutral'}>
                    {unit.status}
                  </Badge>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
