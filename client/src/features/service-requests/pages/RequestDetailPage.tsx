import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { StatusTimeline } from '../../complaints/components/StatusTimeline';
import { ProcessRequestModal } from '../components/ProcessRequestModal';
import { serviceRequestsApi } from '../api/service-requests.api';
import { useAuth } from '../../../hooks/useAuth';
import { requestTypeLabels } from '../../../types/service-request.types';
import type { ServiceRequest } from '../../../types/service-request.types';
import { toast } from 'sonner';

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const [isProcessModalOpen, setProcessModalOpen] = useState(false);
  const [processDefaultStatus, setProcessDefaultStatus] = useState<'approved' | 'rejected' | 'completed'>('approved');

  const fetchRequest = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await serviceRequestsApi.getById(id);
      if (res.data.success) {
        setRequest(res.data.data.serviceRequest);
      }
    } catch (err) {
      toast.error('Failed to load request details');
      navigate('/service-requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleProcess = async (data: any) => {
    if (!id) return;
    try {
      const res = await serviceRequestsApi.process(id, data);
      if (res.data.success) {
        toast.success(`Request ${data.status}`);
        fetchRequest();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process request');
    }
  };

  if (loading || !request) {
    return <div className="text-center py-12 text-charcoal-muted">Loading...</div>;
  }

  const isAdminOrCommittee = role === 'admin' || role === 'committee';

  // Build timeline events
  const timelineEvents: any[] = [
    {
      title: 'Submitted',
      date: format(new Date(request.createdAt), 'PPP p'),
      status: 'completed' as const,
      icon: 'check' as const,
    }
  ];

  if (request.status === 'approved') {
    timelineEvents.push({
      title: 'Approved',
      description: 'Pending completion',
      status: 'completed' as const,
      icon: 'check' as const,
    });
    timelineEvents.push({
      title: 'Completion Pending',
      status: 'pending' as const,
      icon: 'clock' as const,
    });
  } else if (request.status === 'rejected') {
    timelineEvents.push({
      title: 'Rejected',
      status: 'completed' as const,
      icon: 'close' as const,
    });
  } else if (request.status === 'completed') {
    timelineEvents.push({
      title: 'Approved',
      status: 'completed' as const,
      icon: 'check' as const,
    });
    timelineEvents.push({
      title: 'Completed',
      date: request.completedAt ? format(new Date(request.completedAt), 'PPP p') : null,
      status: 'completed' as const,
      icon: 'check' as const,
    });
  } else {
    timelineEvents.push({
      title: 'Approval Pending',
      status: 'pending' as const,
      icon: 'clock' as const,
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate('/service-requests')} className="text-primary hover:underline text-sm mb-4 inline-block">
          ← Back to Service Requests
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal mb-2">{request.title}</h1>
          <div className="flex gap-2">
            <Badge variant={
              request.status === 'pending' ? 'warning' :
              request.status === 'approved' ? 'success' :
              request.status === 'completed' ? 'info' : 'danger'
            }>
              {request.status.toUpperCase()}
            </Badge>
            <Badge variant="info">
              {requestTypeLabels[request.requestType]}
            </Badge>
          </div>
        </div>
        
        {isAdminOrCommittee && (
          <div className="flex gap-3">
            {request.status === 'pending' && (
              <>
                <Button variant="secondary" onClick={() => { setProcessDefaultStatus('rejected'); setProcessModalOpen(true); }} className="text-error border-error/20 hover:bg-error/5 hover:border-error">Reject</Button>
                <Button variant="primary" onClick={() => { setProcessDefaultStatus('approved'); setProcessModalOpen(true); }}>Approve</Button>
              </>
            )}
            {request.status === 'approved' && (
              <Button variant="primary" onClick={() => { setProcessDefaultStatus('completed'); setProcessModalOpen(true); }}>Mark Completed</Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider mb-4">Description</h3>
            <p className="text-charcoal whitespace-pre-wrap">{request.description}</p>
          </Card>

          {request.adminRemarks && (
            <div className="bg-aura/30 p-6 rounded-xl border border-orchid/10">
              <h3 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider mb-2">Admin Remarks</h3>
              <p className="text-charcoal whitespace-pre-wrap">{request.adminRemarks}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider mb-4">Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-charcoal-muted">Request Type</p>
                <p className="font-medium text-charcoal">{requestTypeLabels[request.requestType]}</p>
              </div>
              <div>
                <p className="text-charcoal-muted">Preferred Date</p>
                <p className="font-medium text-charcoal">
                  {request.preferredDate ? format(new Date(request.preferredDate), 'PPP') : 'No preference'}
                </p>
              </div>
              {role !== 'resident' && (
                <div>
                  <p className="text-charcoal-muted">Raised By</p>
                  <p className="font-medium text-charcoal">{request.raisedBy.name}</p>
                  {request.raisedBy.flat && (
                    <p className="text-charcoal-muted text-xs">Flat {request.raisedBy.flat}</p>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider mb-4">Timeline</h3>
            <StatusTimeline events={timelineEvents} />
          </Card>
        </div>
      </div>

      <ProcessRequestModal 
        isOpen={isProcessModalOpen} 
        onClose={() => setProcessModalOpen(false)} 
        onProcess={handleProcess} 
        defaultStatus={processDefaultStatus}
      />
    </div>
  );
};
