# Module 3 — Dashboards

> Three role-specific dashboard views: Admin, Committee, Resident.
> **Depends on**: Module 1 (Foundation), Module 2 (Authentication)

---

## 3.1 Dashboard API — `client/src/features/dashboard/api/dashboard.api.ts`

```typescript
export const dashboardApi = {
  getAdminDashboard: () =>
    api.get<ApiResponse<AdminDashboardData>>('/dashboard/admin'),

  getResidentDashboard: () =>
    api.get<ApiResponse<ResidentDashboardData>>('/dashboard/resident'),
};
```

### Types — add to `types/` or co-locate

```typescript
interface AdminDashboardData {
  occupancy: { totalUnits: number; occupied: number; vacant: number };
  finances: {
    billingPeriod: string;
    totalBilled: string;
    totalCollected: string;
    collectionRatePercent: number;
  };
  tickets: {
    pendingComplaints: number;
    assignedComplaints: number;
    pendingServiceRequests: number;
  };
}

interface ResidentDashboardData {
  outstandingBillsCount: number;
  totalDueAmount: string;
  activeTickets: {
    complaints: { id: string; title: string; status: string }[];
    serviceRequests: { id: string; title: string; status: string }[];
  };
  recentAnnouncements: { id: string; title: string; createdAt: string }[];
}
```

---

## 3.2 Dashboard Page — `client/src/features/dashboard/pages/DashboardPage.tsx`

### Route: `/dashboard`

### Behavior
- Reads `user.role` from auth store
- Renders one of three components based on role:
  - `admin` → `<AdminDashboard />`
  - `committee` → `<CommitteeDashboard />`
  - `resident` → `<ResidentDashboard />`

---

## 3.3 Admin Dashboard — `client/src/features/dashboard/components/AdminDashboard.tsx`

### Data Source
- `GET /api/dashboard/admin` — returns occupancy, finances, tickets

### Layout (3 sections)

#### Section 1: Occupancy Overview
- 3 `<StatCard>` components in a row:
  - **Total Units** — icon: `Building2`, value: `totalUnits`
  - **Occupied** — icon: `Home`, value: `occupied`, trend badge (percentage)
  - **Vacant** — icon: `DoorOpen`, value: `vacant`

#### Section 2: Financial Summary
- 3 `<StatCard>` components:
  - **Total Billed** — icon: `Receipt`, value: formatted currency `₹totalBilled`, label includes billing period
  - **Total Collected** — icon: `IndianRupee`, value: formatted currency
  - **Collection Rate** — icon: `TrendingUp`, value: `collectionRatePercent%`

#### Section 3: Ticket Counters
- 3 `<StatCard>` components:
  - **Pending Complaints** — icon: `MessageSquareWarning`, variant: warning if > 0
  - **Assigned Complaints** — icon: `UserCheck`, variant: info
  - **Pending Service Requests** — icon: `Wrench`, variant: warning if > 0

### Styling
- Page title: "Dashboard" in `font-display text-2xl font-bold text-charcoal`
- Subtitle: "Overview of your society" in `text-charcoal-muted`
- Sections separated with headings in `font-display text-lg font-semibold text-charcoal`
- Cards in `grid grid-cols-1 md:grid-cols-3 gap-6`
- Loading state: skeleton versions of all stat cards

---

## 3.4 Committee Dashboard — `client/src/features/dashboard/components/CommitteeDashboard.tsx`

### Data Sources (multiple API calls)
Based on the PRD, committee members can: view residents, handle complaints, process service requests, publish notices, update status.

- `GET /api/residents?page=1&limit=5` — recent residents preview
- `GET /api/complaints?status=pending&page=1&limit=5` — pending complaints
- `GET /api/complaints?status=assigned&page=1&limit=5` — assigned complaints
- `GET /api/service-requests?status=pending&page=1&limit=5` — pending service requests
- `GET /api/announcements?page=1&limit=3` — recent announcements

### Layout (4 sections in a grid)

#### Section 1: Quick Stats (top row)
- 4 `<StatCard>` components:
  - **Pending Complaints** — clickable, links to `/complaints?status=pending`
  - **Assigned to Me** — complaints where assigned (show from complaints list)
  - **Pending Requests** — links to `/service-requests?status=pending`
  - **Recent Announcements** — count

#### Section 2: Complaints Queue (left column)
- `<Card>` with title "Complaints Awaiting Action"
- Mini table/list of pending + assigned complaints (title, status badge, raised by, date)
- Each row clickable → navigates to `/complaints/:id`
- "View all" link → `/complaints`

#### Section 3: Service Requests Queue (right column)
- `<Card>` with title "Pending Service Requests"
- Mini list of pending requests (title, type badge, raised by, date)
- Each row clickable → navigates to `/service-requests/:id`
- "View all" link → `/service-requests`

#### Section 4: Quick Actions
- `<Card>` with action buttons:
  - "Create Announcement" → `/announcements/new`
  - "View Residents" → `/residents`
  - "View All Complaints" → `/complaints`

### Styling
- Page title: "Committee Dashboard"
- Grid: `grid grid-cols-1 lg:grid-cols-2 gap-6` for the two queue sections
- Top stats: `grid grid-cols-2 md:grid-cols-4 gap-4`

---

## 3.5 Resident Dashboard — `client/src/features/dashboard/components/ResidentDashboard.tsx`

### Data Source
- `GET /api/dashboard/resident` — returns bills, tickets, announcements

### Layout (3 sections)

#### Section 1: Bill Summary
- Prominent `<Card>` with:
  - **Outstanding Bills**: count in large `font-display text-3xl`
  - **Total Due**: formatted currency in `text-error` if > 0, `text-success` if 0
  - CTA button: "View Bills" → `/my-bills` (or "Pay Now" → `/payments/new` if due > 0)

#### Section 2: Active Tickets
- Two sub-sections side by side:
  - **My Complaints** — list of active complaints with status badge, title, clickable → `/complaints/:id`
  - **My Service Requests** — list of active requests with status badge, title, clickable → `/service-requests/:id`
- Empty state if no active tickets: "All caught up! No pending tickets."

#### Section 3: Recent Announcements
- List of 3 most recent announcements:
  - Title, relative date ("2 hours ago"), truncated content
  - Clickable → `/announcements`
- Empty state: "No announcements yet."

### Styling
- Page title: "Welcome back" (optionally include user name from auth store)
- Bill summary card: full width, slightly larger padding, prominent CTA
- Tickets: `grid grid-cols-1 md:grid-cols-2 gap-6`
- Announcements: stacked `<Card>` list

---

## Files Created

```
client/src/features/dashboard/api/dashboard.api.ts
client/src/features/dashboard/pages/DashboardPage.tsx
client/src/features/dashboard/components/AdminDashboard.tsx
client/src/features/dashboard/components/CommitteeDashboard.tsx
client/src/features/dashboard/components/ResidentDashboard.tsx
```

---

## Verification

- Login as **admin** → `/dashboard` shows occupancy, finances, ticket counters
- Login as **committee** → `/dashboard` shows complaints queue, service requests, quick actions
- Login as **resident** → `/dashboard` shows bill summary, active tickets, announcements
- All `<StatCard>` components show "Aura Gate" hover effect
- Loading state shows skeleton cards
- Empty data shows appropriate empty states
- Clicking stat cards or "View all" links navigates to correct pages
