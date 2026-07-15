import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
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
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phoneNumber: '',
    residencyType: 'tenant' as 'owner' | 'tenant',
    vehicleNumber: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

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

  useEffect(() => {
    fetchResidents();
  }, [page, debouncedSearch, residencyType]);

  const openEdit = (resident: Resident) => {
    setEditingResident(resident);
    setEditForm({
      name: resident.name,
      phoneNumber: resident.phoneNumber || '',
      residencyType: resident.residencyType,
      vehicleNumber: resident.vehicleNumber || '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResident) return;

    setSaving(true);
    try {
      const res = await residentsApi.update(editingResident.id, {
        name: editForm.name,
        phoneNumber: editForm.phoneNumber || null,
        residencyType: editForm.residencyType,
        vehicleNumber: editForm.vehicleNumber || null,
      });

      if (res.data.success) {
        toast.success('Resident updated');
        setEditingResident(null);
        fetchResidents();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update resident');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (resident: Resident) => {
    if (!confirm(`Delete ${resident.name}? Their assigned unit will be marked vacant.`)) return;

    try {
      const res = await residentsApi.delete(resident.id);
      if (res.data.success) {
        toast.success('Resident deleted');
        fetchResidents();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete resident');
    }
  };

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
        <ResidentTable data={data} canManage={role === 'admin'} onEdit={openEdit} onDelete={handleDelete} />
      </div>

      {total > 0 && (
        <Pagination 
          page={page} 
          totalPages={Math.ceil(total / limit)} 
          onPageChange={setPage} 
        />
      )}

      <Modal open={!!editingResident} onClose={() => setEditingResident(null)} title="Edit Resident">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Name"
            value={editForm.name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Phone"
            value={editForm.phoneNumber}
            onChange={(e) => setEditForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
          />
          <Select
            label="Residency Type"
            value={editForm.residencyType}
            onChange={(e) => setEditForm((prev) => ({ ...prev, residencyType: e.target.value as 'owner' | 'tenant' }))}
            options={[
              { value: 'owner', label: 'Owner' },
              { value: 'tenant', label: 'Tenant' },
            ]}
          />
          <Input
            label="Vehicle Number"
            value={editForm.vehicleNumber}
            onChange={(e) => setEditForm((prev) => ({ ...prev, vehicleNumber: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditingResident(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
