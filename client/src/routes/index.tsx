import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';

// Pages
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { ResidentsPage } from '../features/residents/pages/ResidentsPage';
import { OnboardResidentPage } from '../features/residents/pages/OnboardResidentPage';
import { UnitsPage } from '../features/units/pages/UnitsPage';
import { CreateUnitPage } from '../features/units/pages/CreateUnitPage';
import { CommitteePage } from '../features/committee/pages/CommitteePage';
import { AssignCommitteePage } from '../features/committee/pages/AssignCommitteePage';
import { AnnouncementsPage } from '../features/announcements/pages/AnnouncementsPage';
import { CreateAnnouncementPage } from '../features/announcements/pages/CreateAnnouncementPage';

import { 
  RegisterPage, ComplaintsPage, LodgeComplaintPage, ComplaintDetailPage,
  ServiceRequestsPage, RaiseRequestPage, RequestDetailPage, BillsPage, GenerateBillsPage,
  BillDetailPage, MyBillsPage, PaymentsPage, MakePaymentPage, DefaultersPage, AuditLogsPage
} from '../pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> }
    ]
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          
          // Committee & Admin roles
          {
            element: <RoleGuard allowedRoles={['admin', 'committee']} />,
            children: [
              { path: 'residents', element: <ResidentsPage /> },
              { path: 'payments', element: <PaymentsPage /> },
              { path: 'reports/defaulters', element: <DefaultersPage /> },
              { path: 'announcements/new', element: <CreateAnnouncementPage /> },
            ]
          },
          
          // Admin only roles
          {
            element: <RoleGuard allowedRoles={['admin']} />,
            children: [
              { path: 'residents/onboard', element: <OnboardResidentPage /> },
              { path: 'units', element: <UnitsPage /> },
              { path: 'units/new', element: <CreateUnitPage /> },
              { path: 'committee/assign', element: <AssignCommitteePage /> },
              { path: 'billing', element: <BillsPage /> },
              { path: 'billing/generate', element: <GenerateBillsPage /> },
              { path: 'audit-logs', element: <AuditLogsPage /> },
            ]
          },
          
          // Resident only roles
          {
            element: <RoleGuard allowedRoles={['resident']} />,
            children: [
              { path: 'complaints/new', element: <LodgeComplaintPage /> },
              { path: 'service-requests/new', element: <RaiseRequestPage /> },
              { path: 'my-bills', element: <MyBillsPage /> },
              { path: 'payments/new', element: <MakePaymentPage /> },
            ]
          },

          // Everyone
          { path: 'committee', element: <CommitteePage /> },
          { path: 'announcements', element: <AnnouncementsPage /> },
          { path: 'complaints', element: <ComplaintsPage /> },
          { path: 'complaints/:id', element: <ComplaintDetailPage /> },
          { path: 'service-requests', element: <ServiceRequestsPage /> },
          { path: 'service-requests/:id', element: <RequestDetailPage /> },
          { path: 'billing/:id', element: <BillDetailPage /> },
        ]
      }
    ]
  }
]);
