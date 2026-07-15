import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/data/Pagination';
import { ComplaintTable } from '../components/ComplaintTable';
import { complaintsApi } from '../api/complaints.api';
import { useAuth } from '../../../hooks/useAuth';
import type { Complaint } from '../../../types/complaint.types';
import { toast } from 'sonner';

export const ComplaintsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isResident = role === 'resident';
  const isAdminOrCommittee = role === 'admin' || role === 'committee';
  
  const [data, setData] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [category, setCategory] = useState<string>('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintsApi.getAll({ 
        page, 
        limit, 
        status: status || undefined,
        priority: priority || undefined,
        category: category || undefined,
      });
      
      if (res.data.success) {
        setData(res.data.data.complaints || []);
        setTotal(res.data.data.pagination?.total || 0);
      }
    } catch (err: any) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, status, priority, category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal mb-1">Complaints</h1>
          <p className="text-charcoal-muted">Track and manage society issues.</p>
        </div>
        {isResident && (
          <Button variant="primary" onClick={() => navigate('/complaints/new')}>
            Lodge Complaint
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-orchid/10 shadow-sm">
        <div className="w-full md:w-48">
          <Select 
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'assigned', label: 'Assigned' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'rejected', label: 'Rejected' },
            ]}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-full md:w-48">
          <Select 
            options={[
              { value: '', label: 'All Priorities' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-full md:w-48">
          <Select 
            options={[
              { value: '', label: 'All Categories' },
              { value: 'Plumbing', label: 'Plumbing' },
              { value: 'Electrical', label: 'Electrical' },
              { value: 'Noise', label: 'Noise' },
              { value: 'Parking', label: 'Parking' },
              { value: 'Maintenance', label: 'Maintenance' },
              { value: 'Security', label: 'Security' },
              { value: 'Other', label: 'Other' },
            ]}
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className={loading ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
        <ComplaintTable data={data} isAdminOrCommittee={isAdminOrCommittee} />
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
