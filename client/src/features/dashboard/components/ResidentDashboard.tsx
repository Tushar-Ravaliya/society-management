import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { dashboardApi, type ResidentDashboardData } from '../api/dashboard.api';
import { formatCurrency } from '../../../lib/formatCurrency';
import { formatRelative } from '../../../lib/formatDate';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'sonner';

export const ResidentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<ResidentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardApi.getResidentDashboard();
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const hasDue = Number(data.totalDueAmount) > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal mb-1">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
        </h1>
        <p className="text-charcoal-muted">Here's your latest update.</p>
      </div>

      <Card className="p-8 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-charcoal-muted font-medium mb-1">Outstanding Bills</p>
            <h2 className="font-display text-3xl font-bold text-charcoal">
              {data.outstandingBillsCount}
            </h2>
          </div>
          <div>
            <p className="text-charcoal-muted font-medium mb-1">Total Due</p>
            <h2 className={`font-display text-3xl font-bold ${hasDue ? 'text-error' : 'text-success'}`}>
              {formatCurrency(Number(data.totalDueAmount))}
            </h2>
          </div>
          <div>
            <Button 
              size="lg"
              variant={hasDue ? 'primary' : 'secondary'}
              onClick={() => navigate(hasDue ? '/payments/new' : '/my-bills')}
            >
              {hasDue ? 'Pay Now' : 'View Bills'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg text-charcoal">My Tickets</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/complaints')}>
              View All
            </Button>
          </div>
          {data.activeTickets.complaints.length === 0 && data.activeTickets.serviceRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-charcoal-muted">All caught up! No pending tickets.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.activeTickets.complaints.map(t => (
                <div 
                  key={t.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-aura cursor-pointer hover:bg-orchid/10 transition-colors"
                  onClick={() => navigate(`/complaints/${t.id}`)}
                >
                  <div>
                    <Badge className="mb-1 text-[10px]" variant="warning">Complaint</Badge>
                    <p className="text-sm font-medium text-charcoal">{t.title}</p>
                  </div>
                  <Badge variant={t.status === 'resolved' ? 'success' : 'neutral'}>{t.status}</Badge>
                </div>
              ))}
              {data.activeTickets.serviceRequests.map(t => (
                <div 
                  key={t.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-aura cursor-pointer hover:bg-orchid/10 transition-colors"
                  onClick={() => navigate(`/service-requests/${t.id}`)}
                >
                  <div>
                    <Badge className="mb-1 text-[10px]" variant="info">Service Req</Badge>
                    <p className="text-sm font-medium text-charcoal">{t.title}</p>
                  </div>
                  <Badge variant={t.status === 'resolved' ? 'success' : 'neutral'}>{t.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg text-charcoal">Recent Announcements</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/announcements')}>
              View All
            </Button>
          </div>
          {data.recentAnnouncements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-charcoal-muted">No announcements yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentAnnouncements.map(a => (
                <div 
                  key={a.id} 
                  className="p-3 border border-orchid/10 rounded-lg cursor-pointer hover:border-orchid/30 hover:bg-aura transition-all"
                  onClick={() => navigate('/announcements')}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-sm text-charcoal line-clamp-1">{a.title}</p>
                    <span className="text-[10px] text-charcoal-muted shrink-0 ml-2">
                      {formatRelative(a.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
