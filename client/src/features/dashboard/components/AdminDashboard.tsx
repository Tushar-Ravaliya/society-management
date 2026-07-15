import React, { useEffect, useState } from 'react';
import { Building2, Home, DoorOpen, Receipt, IndianRupee, TrendingUp, MessageSquareWarning, UserCheck, Wrench } from 'lucide-react';
import { StatCard } from '../../../components/data/StatCard';
import { Skeleton } from '../../../components/ui/Skeleton';
import { dashboardApi, type AdminDashboardData } from '../api/dashboard.api';
import { formatCurrency } from '../../../lib/formatCurrency';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardApi.getAdminDashboard();
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
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal mb-1">Dashboard</h1>
        <p className="text-charcoal-muted">Overview of your society</p>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold text-charcoal mb-4">Occupancy Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={Building2}
            label="Total Units"
            value={data.occupancy.totalUnits}
          />
          <StatCard
            icon={Home}
            label="Occupied"
            value={data.occupancy.occupied}
            trend={{
              value: Math.round((data.occupancy.occupied / data.occupancy.totalUnits) * 100) || 0,
              positive: true,
            }}
          />
          <StatCard
            icon={DoorOpen}
            label="Vacant"
            value={data.occupancy.vacant}
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-charcoal mb-4">Financial Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={Receipt}
            label={`Total Billed (${data.finances.billingPeriod})`}
            value={formatCurrency(Number(data.finances.totalBilled))}
          />
          <StatCard
            icon={IndianRupee}
            label="Total Collected"
            value={formatCurrency(Number(data.finances.totalCollected))}
          />
          <StatCard
            icon={TrendingUp}
            label="Collection Rate"
            value={`${data.finances.collectionRatePercent}%`}
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-charcoal mb-4">Ticket Counters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={MessageSquareWarning}
            label="Pending Complaints"
            value={data.tickets.pendingComplaints}
            className={data.tickets.pendingComplaints > 0 ? "border-warning/30 bg-warning/5" : ""}
          />
          <StatCard
            icon={UserCheck}
            label="Assigned Complaints"
            value={data.tickets.assignedComplaints}
          />
          <StatCard
            icon={Wrench}
            label="Pending Service Requests"
            value={data.tickets.pendingServiceRequests}
            className={data.tickets.pendingServiceRequests > 0 ? "border-warning/30 bg-warning/5" : ""}
          />
        </div>
      </section>
    </div>
  );
};
