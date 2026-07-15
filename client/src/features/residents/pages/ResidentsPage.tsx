import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/data/Pagination';
import { ResidentTable } from '../components/ResidentTable';
import { residentsApi } from '../api/residents.api';
import { useAuth } from '../../../hooks/useAuth';
import type { Resident } from '../../../types/resident.types';
import { toast } from 'sonner';

export const ResidentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  
  const [data, setData] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [residencyType, setResidencyType] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchResidents = async () => {
      setLoading(true);
      try {
        const res = await residentsApi.getDirectory({ 
          page, 
          limit, 
          search: debouncedSearch,
          residencyType: residencyType || undefined
        });
        
        if (res.data.success) {
          setData(res.data.data.residents || []);
          setTotal(res.data.data.pagination?.total || 0);
        }
      } catch (err: any) {
        toast.error('Failed to load residents');
      } finally {
        setLoading(false);
      }
    };
    fetchResidents();
  }, [page, debouncedSearch, residencyType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal mb-1">Residents Directory</h1>
          <p className="text-charcoal-muted">View all residents in the society.</p>
        </div>
        {role === 'admin' && (
          <Button variant="primary" onClick={() => navigate('/residents/onboard')}>
            Onboard Resident
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-orchid/10 shadow-sm">
        <div className="w-full md:w-64">
          <Input 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-full md:w-48">
          <Select 
            options={[
              { value: '', label: 'All Types' },
              { value: 'owner', label: 'Owner' },
              { value: 'tenant', label: 'Tenant' }
            ]}
            value={residencyType}
            onChange={(e) => { setResidencyType(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className={loading ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
        <ResidentTable data={data} />
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
