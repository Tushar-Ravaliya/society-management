import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
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
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    block: '',
    flatNumber: '',
    floor: 0,
    bhkType: '',
  });

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

  useEffect(() => {
    fetchUnits();
  }, [page, status]);

  const openEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setEditForm({
      block: unit.block,
      flatNumber: unit.flatNumber,
      floor: unit.floor,
      bhkType: unit.bhkType,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;

    setSaving(true);
    try {
      const res = await unitsApi.update(editingUnit.id, editForm);
      if (res.data.success) {
        toast.success('Unit updated');
        setEditingUnit(null);
        fetchUnits();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update unit');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (unit: Unit) => {
    if (!confirm(`Delete unit ${unit.block}-${unit.flatNumber}?`)) return;

    try {
      const res = await unitsApi.delete(unit.id);
      if (res.data.success) {
        toast.success('Unit deleted');
        fetchUnits();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete unit');
    }
  };

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
        <UnitTable data={data} onEdit={openEdit} onDelete={handleDelete} />
      </div>

      {total > 0 && (
        <Pagination 
          page={page} 
          totalPages={Math.ceil(total / limit)} 
          onPageChange={setPage} 
        />
      )}

      <Modal open={!!editingUnit} onClose={() => setEditingUnit(null)} title="Edit Unit">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Block"
            value={editForm.block}
            onChange={(e) => setEditForm((prev) => ({ ...prev, block: e.target.value }))}
            required
          />
          <Input
            label="Flat Number"
            value={editForm.flatNumber}
            onChange={(e) => setEditForm((prev) => ({ ...prev, flatNumber: e.target.value }))}
            required
          />
          <Input
            label="Floor"
            type="number"
            value={editForm.floor}
            onChange={(e) => setEditForm((prev) => ({ ...prev, floor: Number(e.target.value) }))}
            required
          />
          <Input
            label="BHK Type"
            value={editForm.bhkType}
            onChange={(e) => setEditForm((prev) => ({ ...prev, bhkType: e.target.value }))}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditingUnit(null)}>
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
