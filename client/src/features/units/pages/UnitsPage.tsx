import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/data/Pagination';
import { UnitTable } from '../components/UnitTable';
import { unitsApi } from '../api/units.api';
import type { Unit } from '../../../types/unit.types';
import { toast } from 'sonner';

export const UnitsPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [data, setData] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true);
      try {
        const res = await unitsApi.getUnits({ 
          page, 
          limit, 
          status: status || undefined
        });
        
        if (res.data.success) {
          setData(res.data.data.units || []);
          setTotal(res.data.data.pagination?.total || 0);
        }
      } catch (err: any) {
        toast.error('Failed to load units');
      } finally {
        setLoading(false);
      }
    };
    fetchUnits();
  }, [page, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal mb-1">Units</h1>
          <p className="text-charcoal-muted">Manage society blocks and flats.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/units/new')}>
          Create Unit
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-orchid/10 shadow-sm">
        <div className="w-full md:w-48">
          <Select 
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'occupied', label: 'Occupied' },
              { value: 'vacant', label: 'Vacant' }
            ]}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className={loading ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
        <UnitTable data={data} />
      </div>

      {total > 0 && (
        <Pagination 
          page={page} 
          totalPages={Math.ceil(total / limit)} 
          onPageChange={setPage} 
        />
      )}
    </div>
  );
};
