import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/data/Pagination';
import { RequestTable } from '../components/RequestTable';
import { serviceRequestsApi } from '../api/service-requests.api';
import { useAuth } from '../../../hooks/useAuth';
import type { ServiceRequest } from '../../../types/service-request.types';
import { toast } from 'sonner';

export const ServiceRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isResident = role === 'resident';
  const isAdminOrCommittee = role === 'admin' || role === 'committee';
  
  const [data, setData] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [status, setStatus] = useState<string>('');
  const [type, setType] = useState<string>('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await serviceRequestsApi.getAll({ 
        page, 
        limit, 
        status: status || undefined,
        type: type || undefined,
      });
      
      if (res.data.success) {
        setData(res.data.data.serviceRequests || []);
        setTotal(res.data.data.pagination?.total || 0);
      }
    } catch (err: any) {
      toast.error('Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, status, type]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal mb-1">Service Requests</h1>
          <p className="text-charcoal-muted">Manage NOCs, bookings, and permissions.</p>
        </div>
        {isResident && (
          <Button variant="primary" onClick={() => navigate('/service-requests/new')}>
            Raise Request
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-orchid/10 shadow-sm">
        <div className="w-full md:w-48">
          <Select 
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'completed', label: 'Completed' },
            ]}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-full md:w-56">
          <Select 
            options={[
              { value: '', label: 'All Types' },
              { value: 'noc', label: 'NOC' },
              { value: 'clubhouse_booking', label: 'Clubhouse Booking' },
              { value: 'renovation_permission', label: 'Renovation Permission' },
              { value: 'parking_allocation', label: 'Parking Allocation' },
              { value: 'other', label: 'Other' },
            ]}
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className={loading ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
        <RequestTable data={data} isAdminOrCommittee={isAdminOrCommittee} />
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
