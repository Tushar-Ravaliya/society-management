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

import { ComplaintsPage } from '../features/complaints/pages/ComplaintsPage';
import { LodgeComplaintPage } from '../features/complaints/pages/LodgeComplaintPage';
import { ComplaintDetailPage } from '../features/complaints/pages/ComplaintDetailPage';
import { ServiceRequestsPage } from '../features/service-requests/pages/ServiceRequestsPage';
import { RaiseRequestPage } from '../features/service-requests/pages/RaiseRequestPage';
import { RequestDetailPage } from '../features/service-requests/pages/RequestDetailPage';

import { RegisterPage } from '../pages'; // Keeping RegisterPage from pages if it was not created in auth yet, but let's assume I create it or import it. Wait, the user didn't explicitly ask for RegisterPage but I will import what I just made.
import { BillsPage } from '../features/billing/pages/BillsPage';
import { GenerateBillsPage } from '../features/billing/pages/GenerateBillsPage';
import { BillDetailPage } from '../features/billing/pages/BillDetailPage';
import { MyBillsPage } from '../features/billing/pages/MyBillsPage';
import { PaymentsPage } from '../features/payments/pages/PaymentsPage';
import { MakePaymentPage } from '../features/payments/pages/MakePaymentPage';
import { DefaultersPage } from '../features/reports/pages/DefaultersPage';
import { AuditLogsPage } from '../features/audit/pages/AuditLogsPage';
import { NotFoundPage } from '../features/auth/pages/NotFoundPage';

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
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);
