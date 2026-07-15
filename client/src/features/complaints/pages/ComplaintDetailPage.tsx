import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { StatusTimeline } from '../components/StatusTimeline';
import { AssignComplaintModal } from '../components/AssignComplaintModal';
import { ResolveComplaintModal } from '../components/ResolveComplaintModal';
import { complaintsApi } from '../api/complaints.api';
import { useAuth } from '../../../hooks/useAuth';
import type { Complaint } from '../../../types/complaint.types';
import { toast } from 'sonner';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, user } = useAuth();
  
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [isResolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveDefaultStatus, setResolveDefaultStatus] = useState<'resolved' | 'rejected'>('resolved');

  const fetchComplaint = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await complaintsApi.getById(id);
      if (res.data.success) {
        setComplaint(res.data.data.complaint);
      }
    } catch (err) {
      toast.error('Failed to load complaint details');
      navigate('/complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleAssign = async (data: { assignedToId: string }) => {
    if (!id) return;
    try {
      const res = await complaintsApi.assign(id, data);
      if (res.data.success) {
        toast.success('Complaint assigned');
        fetchComplaint();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign');
    }
  };

  const handleResolve = async (data: { status: 'resolved' | 'rejected'; resolutionDetails: string }) => {
    if (!id) return;
    try {
      const res = await complaintsApi.resolve(id, data);
      if (res.data.success) {
        toast.success(`Complaint ${data.status}`);
        fetchComplaint();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resolve');
    }
  };

  if (loading || !complaint) {
    return <div className="text-center py-12 text-charcoal-muted">Loading...</div>;
  }

  const isAdmin = role === 'admin';
  const isAssignedToMe = role === 'committee' && complaint.assignedTo?.id === user?.id;
  const canAssign = isAdmin && complaint.status === 'pending';
  const canResolve = (isAdmin || isAssignedToMe) && (complaint.status === 'pending' || complaint.status === 'assigned');

  // Build timeline events
  const timelineEvents: any[] = [
    {
      title: 'Submitted',
      description: `By ${complaint.raisedBy.name}`,
      date: format(new Date(complaint.createdAt), 'PPP p'),
      status: 'completed' as const,
      icon: 'check' as const,
    }
  ];

  if (complaint.status === 'assigned' || complaint.status === 'resolved' || complaint.status === 'rejected') {
    if (complaint.assignedTo) {
      timelineEvents.push({
        title: 'Assigned',
        description: `To ${complaint.assignedTo.name}`,
        status: 'completed' as const,
        icon: 'assign' as const,
      });
    }
  }

  if (complaint.status === 'resolved' || complaint.status === 'rejected') {
    timelineEvents.push({
      title: complaint.status === 'resolved' ? 'Resolved' : 'Rejected',
      date: complaint.resolvedAt ? format(new Date(complaint.resolvedAt), 'PPP p') : null,
      status: 'completed' as const,
      icon: complaint.status === 'resolved' ? 'check' : 'close',
    });
  } else {
    timelineEvents.push({
      title: 'Resolution Pending',
      status: 'pending' as const,
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate('/complaints')} className="text-primary hover:underline text-sm mb-4 inline-block">
          ← Back to Complaints
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal mb-2">{complaint.title}</h1>
          <div className="flex gap-2">
            <Badge variant={
              complaint.status === 'pending' ? 'warning' :
              complaint.status === 'assigned' ? 'info' :
              complaint.status === 'resolved' ? 'success' : 'danger'
            }>
              {complaint.status.toUpperCase()}
            </Badge>
            <Badge variant={
              complaint.priority === 'high' ? 'danger' :
              complaint.priority === 'medium' ? 'warning' : 'neutral'
            }>
              {complaint.priority.toUpperCase()} PRIORITY
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-3">
          {canAssign && (
            <Button variant="secondary" onClick={() => setAssignModalOpen(true)}>Assign</Button>
          )}
          {canResolve && (
            <>
              <Button variant="secondary" onClick={() => { setResolveDefaultStatus('rejected'); setResolveModalOpen(true); }} className="text-error border-error/20 hover:bg-error/5 hover:border-error">Reject</Button>
              <Button variant="primary" onClick={() => { setResolveDefaultStatus('resolved'); setResolveModalOpen(true); }}>Resolve</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider mb-4">Description</h3>
            <p className="text-charcoal whitespace-pre-wrap">{complaint.description}</p>
          </Card>

          {complaint.imageUrl && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider mb-4">Attachment</h3>
              <a href={complaint.imageUrl} target="_blank" rel="noreferrer" className="block w-full overflow-hidden rounded-lg border border-orchid/10">
                <img src={complaint.imageUrl} alt="Complaint Attachment" className="w-full object-cover max-h-96" />
              </a>
            </Card>
          )}

          {complaint.resolutionDetails && (
            <Card className={`p-6 ${complaint.status === 'resolved' ? 'bg-success/5 border-success/20' : 'bg-error/5 border-error/20'}`}>
              <h3 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider mb-4">Resolution Details</h3>
              <p className="text-charcoal whitespace-pre-wrap">{complaint.resolutionDetails}</p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider mb-4">Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-charcoal-muted">Category</p>
                <p className="font-medium text-charcoal">{complaint.category}</p>
              </div>
              {role !== 'resident' && (
                <div>
                  <p className="text-charcoal-muted">Raised By</p>
                  <p className="font-medium text-charcoal">{complaint.raisedBy.name}</p>
                  <p className="text-charcoal-muted text-xs">{complaint.raisedBy.email}</p>
                </div>
              )}
              <div>
                <p className="text-charcoal-muted">Assigned To</p>
                {complaint.assignedTo ? (
                  <>
                    <p className="font-medium text-charcoal">{complaint.assignedTo.name}</p>
                    <p className="text-charcoal-muted text-xs">{complaint.assignedTo.email}</p>
                  </>
                ) : (
                  <p className="font-medium text-charcoal italic">Unassigned</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider mb-4">Timeline</h3>
            <StatusTimeline events={timelineEvents} />
          </Card>
        </div>
      </div>

      <AssignComplaintModal 
        isOpen={isAssignModalOpen} 
        onClose={() => setAssignModalOpen(false)} 
        onAssign={handleAssign} 
      />
      <ResolveComplaintModal 
        isOpen={isResolveModalOpen} 
        onClose={() => setResolveModalOpen(false)} 
        onResolve={handleResolve} 
        defaultStatus={resolveDefaultStatus}
      />
    </div>
  );
};
