import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquareWarning, Wrench, UserCheck, Megaphone } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { StatCard } from '../../../components/data/StatCard';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Button } from '../../../components/ui/Button';
import { api } from '../../../config/api';
import { formatRelative } from '../../../lib/formatDate';
import { toast } from 'sonner';

export const CommitteeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    pendingComplaints: [],
    assignedComplaints: [],
    pendingRequests: [],
    announcements: []
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [complaintsPendingRes, complaintsAssignedRes, requestsRes, announcementsRes] = await Promise.allSettled([
          api.get('/complaints?status=pending&page=1&limit=5'),
          api.get('/complaints?status=assigned&page=1&limit=5'),
          api.get('/service-requests?status=pending&page=1&limit=5'),
          api.get('/announcements?page=1&limit=3')
        ]);

        const pendingC = complaintsPendingRes.status === 'fulfilled' ? complaintsPendingRes.value.data?.data || [] : [];
        const assignedC = complaintsAssignedRes.status === 'fulfilled' ? complaintsAssignedRes.value.data?.data || [] : [];
        const pendingR = requestsRes.status === 'fulfilled' ? requestsRes.value.data?.data || [] : [];
        const ann = announcementsRes.status === 'fulfilled' ? announcementsRes.value.data?.data || [] : [];

        // For now, since endpoints don't exist yet, we will just use empty arrays if they fail or return html
        setData({
          pendingComplaints: Array.isArray(pendingC) ? pendingC : [],
          assignedComplaints: Array.isArray(assignedC) ? assignedC : [],
          pendingRequests: Array.isArray(pendingR) ? pendingR : [],
          announcements: Array.isArray(ann) ? ann : []
        });
      } catch (err: any) {
        toast.error('Failed to load committee dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal mb-1">Committee Dashboard</h1>
        <p className="text-charcoal-muted">Manage requests and oversee operations.</p>
      </div>

      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div onClick={() => navigate('/complaints')} className="cursor-pointer">
            <StatCard
              icon={MessageSquareWarning}
              label="Pending Complaints"
              value={data.pendingComplaints.length}
            />
          </div>
          <div onClick={() => navigate('/complaints')} className="cursor-pointer">
            <StatCard
              icon={UserCheck}
              label="Assigned to Me"
              value={data.assignedComplaints.length}
            />
          </div>
          <div onClick={() => navigate('/service-requests')} className="cursor-pointer">
            <StatCard
              icon={Wrench}
              label="Pending Requests"
              value={data.pendingRequests.length}
            />
          </div>
          <div onClick={() => navigate('/announcements')} className="cursor-pointer">
            <StatCard
              icon={Megaphone}
              label="Announcements"
              value={data.announcements.length}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg text-charcoal">Complaints Awaiting Action</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/complaints')}>
              View All
            </Button>
          </div>
          {data.pendingComplaints.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-charcoal-muted text-sm">No pending complaints.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.pendingComplaints.map((c: any) => (
                <div 
                  key={c.id} 
                  className="p-3 border border-orchid/10 rounded-lg cursor-pointer hover:bg-aura transition-colors flex items-center justify-between"
                  onClick={() => navigate(`/complaints/${c.id}`)}
                >
                  <div>
                    <p className="text-sm font-medium text-charcoal">{c.title || 'Untitled'}</p>
                    <p className="text-xs text-charcoal-muted mt-0.5">Raised {formatRelative(c.createdAt)}</p>
                  </div>
                  <Badge variant="warning">{c.status || 'Pending'}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg text-charcoal">Pending Service Requests</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/service-requests')}>
                View All
              </Button>
            </div>
            {data.pendingRequests.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-charcoal-muted text-sm">No pending service requests.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.pendingRequests.map((r: any) => (
                  <div 
                    key={r.id} 
                    className="p-3 border border-orchid/10 rounded-lg cursor-pointer hover:bg-aura transition-colors flex items-center justify-between"
                    onClick={() => navigate(`/service-requests/${r.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-charcoal">{r.title || 'Untitled'}</p>
                      <p className="text-xs text-charcoal-muted mt-0.5">Raised {formatRelative(r.createdAt)}</p>
                    </div>
                    <Badge variant="info">{r.type || 'Request'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-display font-semibold text-lg text-charcoal mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => navigate('/announcements/new')} className="w-full text-sm">
                Create Notice
              </Button>
              <Button variant="secondary" onClick={() => navigate('/residents')} className="w-full text-sm">
                View Residents
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};
