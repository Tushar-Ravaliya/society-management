import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { AdminDashboard } from '../components/AdminDashboard';
import { CommitteeDashboard } from '../components/CommitteeDashboard';
import { ResidentDashboard } from '../components/ResidentDashboard';
import { Navigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { role } = useAuth();

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  if (role === 'committee') {
    return <CommitteeDashboard />;
  }

  if (role === 'resident') {
    return <ResidentDashboard />;
  }

  return <Navigate to="/login" replace />;
};
