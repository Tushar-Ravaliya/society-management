import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface RoleGuardProps {
  allowedRoles: string[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { role } = useAuth();

  if (!role || !allowedRoles.includes(role)) {
    // Or return a 403 Access Denied component here
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
