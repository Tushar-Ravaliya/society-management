# Module 9 — Reports, Audit & Polish

> Defaulters report, audit logs, final responsive polish, error handling, and build validation.
> **Depends on**: Module 1 (Foundation)

---

## 9.1 Reports API — `client/src/features/reports/api/reports.api.ts`

```typescript
export const reportsApi = {
  getDefaulters: () =>
    api.get('/reports/defaulters'),
};
```

### Backend Endpoint
- `GET /api/reports/defaulters` — Admin/Committee access
- Returns:
```typescript
{
  defaulters: Array<{
    flat: string;           // e.g., "A-101"
    residentName: string;
    email: string;
    overdueAmount: string;  // e.g., "15000.00"
    missedPeriods: string[]; // e.g., ["Jun 2025", "Jul 2025"]
  }>
}
```

---

## 9.2 Defaulters Report — `client/src/features/reports/pages/DefaultersPage.tsx`

### Route: `/reports/defaulters`
### Access: Admin, Committee

### Layout
- Page header: "Defaulters Report"
  - Subtitle: "Residents with overdue maintenance bills"
- **DefaultersTable** using `<DataTable>`

### DefaultersTable Columns — `components/DefaultersTable.tsx`
- **Flat** — e.g., "A-101"
- **Resident** — name
- **Email** — email
- **Overdue Amount** — formatted currency in `text-error font-semibold`
- **Missed Periods** — comma-separated list or multiple `<Badge variant="danger">` pills

### Summary Stats (above table)
- Total defaulters count
- Total overdue amount (sum of all `overdueAmount`)
- Displayed in 2 `<StatCard>` components

### Empty State
- "No defaulters found. All bills are up to date!" with a success icon

---

## 9.3 Audit API — `client/src/features/audit/api/audit.api.ts`

```typescript
export const auditApi = {
  getLogs: (params: { page?: number; limit?: number; module?: string; action?: string }) =>
    api.get('/admin/audit-logs', { params }),
};
```

### Backend Endpoint
- `GET /api/admin/audit-logs?page=1&limit=20&module=&action=`
- Admin only
- Returns `{ logs: [...], pagination: {...} }`

### Types
```typescript
export interface AuditLog {
  id: string;
  action: string;
  module: string;
  targetId: string | null;
  description: string;
  ipAddress: string | null;
  createdAt: string;
  actor: {
    name: string;
    email: string;
  } | null;
}
```

---

## 9.4 Audit Logs Page — `client/src/features/audit/pages/AuditLogsPage.tsx`

### Route: `/audit-logs`
### Access: Admin only

### Layout
- Page header: "Audit Logs"
  - Subtitle: "System activity log"
- Filter bar:
  - **Module** — `<Select>` with "All", "billing", "payments", "complaints", "service-requests", "auth", etc.
  - **Action** — `<Select>` with "All", "BILL_GENERATED", "PAYMENT_VERIFIED", "PAYMENT_REJECTED", etc.
- **AuditTable** using `<DataTable>`
- `<Pagination>`

### AuditTable Columns — `components/AuditTable.tsx`
- **Timestamp** — formatted date + time
- **Actor** — name (or "System" if null)
- **Action** — `<Badge variant="info">` with action name
- **Module** — text
- **Description** — truncated description text (expandable on click or tooltip)

### Styling Notes
- This is a dense data table — use `text-sm` throughout
- Compact rows with less padding
- Most recent logs at the top (backend sorts by `createdAt desc`)

---

## 9.5 Final Polish Tasks

### 9.5.1 Error Boundary
Ensure `<ErrorBoundary>` wraps the main app content in `App.tsx`:
```tsx
<ErrorBoundary>
  <RouterProvider router={router} />
</ErrorBoundary>
```

Fallback UI:
- Centered card with "Something went wrong" message
- "Try Again" button that reloads the page
- Styled with the design system (not a raw HTML error)

### 9.5.2 404 Not Found Page
Create `client/src/features/auth/pages/NotFoundPage.tsx`:
- Large "404" in `font-display text-6xl text-primary`
- "Page not found"
- "Go to Dashboard" button
- Add as catch-all route: `{ path: '*', element: <NotFoundPage /> }`

### 9.5.3 Loading States
Verify all pages have proper loading states:
- Dashboard: skeleton stat cards
- Tables: skeleton rows
- Detail pages: skeleton blocks
- Forms: button loading states (spinner + disabled)

### 9.5.4 Empty States
Verify all list pages show `<EmptyState>` when data is empty:
- Meaningful message (not just "No data")
- CTA button where appropriate (e.g., "Lodge a complaint" on empty complaints page)

### 9.5.5 Responsive Layout Testing
Test all pages at these breakpoints:
- **Mobile** (< 640px): sidebar hidden, hamburger toggle, tables scroll horizontally, stat cards stack
- **Tablet** (640-1024px): sidebar collapsible, 2-column grids
- **Desktop** (> 1024px): sidebar visible, 3-column grids, full tables

### 9.5.6 Toast Consistency
Ensure all mutation operations show appropriate toasts:
- Success: green toast with descriptive message
- Error: red toast with backend error message
- Info: blue toast for neutral info

### 9.5.7 Form Validation Consistency
All forms should:
- Show inline errors below fields (not just toasts)
- Disable submit button when form is invalid
- Show loading spinner on submit button during API call
- Clear errors when user starts typing

### 9.5.8 Keyboard Accessibility
- All interactive elements focusable via Tab
- Modals trap focus
- Escape closes modals
- Enter submits forms

---

## Files Created

```
client/src/features/reports/api/reports.api.ts
client/src/features/reports/pages/DefaultersPage.tsx
client/src/features/reports/components/DefaultersTable.tsx

client/src/features/audit/api/audit.api.ts
client/src/features/audit/pages/AuditLogsPage.tsx
client/src/features/audit/components/AuditTable.tsx

client/src/features/auth/pages/NotFoundPage.tsx

client/src/routes/index.tsx                (add 404 catch-all route)
```

---

## Verification

### Functional
- Navigate to `/reports/defaulters` as Admin → shows defaulters table
- Navigate as Committee → also accessible
- Navigate as Resident → access denied
- Navigate to `/audit-logs` as Admin → shows activity logs with filters
- Filter by module/action → table updates
- Pagination works
- Navigate to `/nonexistent-page` → shows 404 page

### Build
- `bun run build` — compiles without TypeScript errors
- No console warnings or errors during navigation

### Responsive
- All pages render correctly on mobile (375px)
- Sidebar toggles on mobile
- Tables scroll horizontally on small screens
- Forms are usable on mobile (full-width inputs)

### Polish
- All loading states show skeletons (not blank screens)
- All empty states show meaningful messages
- All mutations show toast feedback
- All modals close on Escape / outside click
- "Aura Gate" hover effects work on all cards
- Purple focus rings visible on all inputs
- Fonts load correctly (Plus Jakarta Sans + Inter)
