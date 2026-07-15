import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { CommitteeList } from '../components/CommitteeList';
import { committeeApi } from '../api/committee.api';
import { useAuth } from '../../../hooks/useAuth';
import type { CommitteeMember } from '../../../types/committee.types';
import { toast } from 'sonner';
import { Skeleton } from '../../../components/ui/Skeleton';

export const CommitteePage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    designation: '',
    portfolio: '',
    isActive: true,
  });

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await committeeApi.getMembers(false);
      if (res.data.success) {
        setMembers(res.data.data.committee || []);
      }
    } catch (err) {
      toast.error('Failed to load committee members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleEdit = (member: CommitteeMember) => {
    setEditingMember(member);
    setEditForm({
      designation: member.designation,
      portfolio: member.portfolio,
      isActive: member.isActive,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setSaving(true);
    try {
      const res = await committeeApi.update(editingMember.id, editForm);
      if (res.data.success) {
        toast.success('Committee member updated');
        setEditingMember(null);
        fetchMembers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update committee member');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: CommitteeMember) => {
    if (!confirm(`Remove ${member.name} from the committee?`)) return;

    try {
      const res = await committeeApi.delete(member.id);
      if (res.data.success) {
        toast.success('Committee member removed');
        fetchMembers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove committee member');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal mb-1">Committee Members</h1>
          <p className="text-charcoal-muted">Meet your society's managing committee.</p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => navigate('/committee/assign')}>
            Assign Member
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <CommitteeList members={members} isAdmin={isAdmin} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <Modal open={!!editingMember} onClose={() => setEditingMember(null)} title="Edit Committee Member">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Designation"
            value={editForm.designation}
            onChange={(e) => setEditForm((prev) => ({ ...prev, designation: e.target.value }))}
            required
          />
          <Input
            label="Portfolio"
            value={editForm.portfolio}
            onChange={(e) => setEditForm((prev) => ({ ...prev, portfolio: e.target.value }))}
            required
          />
          <Select
            label="Status"
            value={editForm.isActive ? 'active' : 'inactive'}
            onChange={(e) => setEditForm((prev) => ({ ...prev, isActive: e.target.value === 'active' }))}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditingMember(null)}>
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
