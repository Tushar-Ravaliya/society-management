# Module 1 — Foundation

> Install dependencies, design tokens, reusable components, layouts, routing, stores, and API config.
> This module produces zero pages but every subsequent module depends on it.

---

## 1.1 Install Dependencies

```bash
cd client
bun add react-router-dom axios zustand react-hook-form @hookform/resolvers zod lucide-react sonner date-fns clsx tailwind-merge
```

---

## 1.2 Environment Variables

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_RAZORPAY_KEY_ID=rzp_test_TDHYhSPkm3UYq8
```

---

## 1.3 Design Tokens — `client/src/index.css`

Set up Tailwind v4 with custom theme tokens from [ui-consistency.md](file:///d:/personal%20projects/society%20management/ui-consistency.md):

```css
@import "tailwindcss";

@theme {
  --color-white-base: #FFFFFF;
  --color-aura: #F8F6FC;
  --color-primary: #6D28D9;
  --color-primary-dark: #4C1D95;
  --color-orchid: #A78BFA;
  --color-charcoal: #1F1A24;
  --color-charcoal-muted: #6B5F73;
  --color-error: #DC2626;
  --color-success: #059669;
  --color-warning: #D97706;

  --font-display: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

Add Google Fonts to `client/index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700&display=swap" rel="stylesheet">
```

Update `<title>` to `Society Management`.

---

## 1.4 Utility Functions — `client/src/lib/`

### `cn.ts`
Combine clsx + tailwind-merge for conditional class merging.

### `formatCurrency.ts`
Format numbers to Indian Rupee: `₹1,200.00`

### `formatDate.ts`
Wrappers around date-fns: `formatDate()`, `formatRelative()`, `formatDateTime()`

---

## 1.5 TypeScript Types — `client/src/types/`

### `common.types.ts`
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### `auth.types.ts`
```typescript
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'committee' | 'resident';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
}
```

### Also create placeholder type files for:
- `resident.types.ts` — Unit, ResidentProfile
- `billing.types.ts` — Bill, Payment
- `complaint.types.ts` — Complaint, ComplaintStatus, ComplaintPriority
- `service-request.types.ts` — ServiceRequest, RequestType
- `announcement.types.ts` — Announcement, AnnouncementAudience
- `committee.types.ts` — CommitteeMember

> Derive all types from the backend schema at [schema.ts](file:///d:/personal%20projects/society%20management/server/src/db/schema.ts). Match field names to what the backend controllers/services actually return (camelCase).

---

## 1.6 API Config — `client/src/config/api.ts`

Create an Axios instance:
- `baseURL`: `VITE_API_URL` + `/api` (or use Vite proxy — see below)
- `withCredentials: true` (sends httpOnly cookies)
- **Response interceptor**: On 401 with `{ code: 'TOKEN_EXPIRED' }`, call `POST /api/auth/refresh` once, then retry the original request. If refresh also fails, clear auth store and redirect to `/login`.

### Vite Proxy (recommended for dev)

In `client/vite.config.ts`, add a proxy so `/api` requests go to the backend:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

With this, the Axios `baseURL` can just be `/api`.

---

## 1.7 Zustand Stores — `client/src/stores/`

### `auth.store.ts`
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // true while checking /auth/me on app boot
  setUser: (user: User | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>; // calls GET /api/auth/me
}
```

### `ui.store.ts`
```typescript
interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}
```

---

## 1.8 Shared Hooks — `client/src/hooks/`

### `useAuth.ts`
Convenience hook that reads from `useAuthStore()` and provides `user`, `role`, `isAuthenticated`, `isLoading`.

---

## 1.9 Reusable Components — `client/src/components/`

### UI Primitives (`components/ui/`)

| File | Component | Key Props | Styling Notes |
|---|---|---|---|
| `Button.tsx` | `<Button>` | `variant: 'primary' \| 'secondary' \| 'danger' \| 'ghost'`, `size: 'sm' \| 'md' \| 'lg'`, `loading`, `disabled`, `icon`, `children` | Primary: `bg-primary text-white hover:bg-primary-dark active:scale-95`. Secondary: `bg-white border-orchid text-primary hover:bg-aura`. Danger: `bg-error text-white`. Ghost: `bg-transparent text-charcoal-muted hover:bg-aura`. All: `font-body font-medium transition-all duration-200 rounded-lg`. Loading: show Spinner, disable click. |
| `Input.tsx` | `<Input>` | `label`, `error`, `type`, `placeholder`, all native input props via `forwardRef` | `border border-orchid/20 rounded-lg px-3 py-2 font-body focus:ring-2 focus:ring-primary/20 focus:border-primary`. Error state: `border-error`. Label in `text-charcoal font-medium text-sm`. Error message in `text-error text-xs mt-1`. |
| `Textarea.tsx` | `<Textarea>` | `label`, `error`, `rows` | Same styling as Input, but `<textarea>`. |
| `Select.tsx` | `<Select>` | `label`, `error`, `options: { label: string; value: string }[]`, `placeholder` | Styled dropdown, same border/focus pattern as Input. |
| `Badge.tsx` | `<Badge>` | `variant: 'success' \| 'warning' \| 'danger' \| 'neutral' \| 'info'`, `children` | Pill shape: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`. Colors: success=emerald bg/text, warning=amber, danger=crimson, neutral=charcoal-muted, info=primary/orchid. |
| `Card.tsx` | `<Card>` | `children`, `hover?: boolean`, `className` | "Aura Gate" card: `bg-white border border-orchid/10 rounded-xl shadow-[0_8px_30px_rgba(109,40,217,0.04)]`. Hover (when `hover=true`): `hover:border-orchid/30 hover:shadow-[0_12px_40px_rgba(109,40,217,0.08)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`. |
| `Modal.tsx` | `<Modal>` | `open`, `onClose`, `title`, `children`, `size?: 'sm' \| 'md' \| 'lg'` | React Portal. Backdrop: `bg-charcoal/50 backdrop-blur-sm`. Content: centered Card with close button. Escape key closes. Click-outside closes. |
| `Avatar.tsx` | `<Avatar>` | `name`, `src?`, `size: 'sm' \| 'md' \| 'lg'` | Circle. If no `src`, show first 2 initials on a purple gradient background. |
| `Spinner.tsx` | `<Spinner>` | `size: 'sm' \| 'md' \| 'lg'` | Animated spinning circle, `border-primary border-t-transparent`. |
| `EmptyState.tsx` | `<EmptyState>` | `title`, `description`, `action?: { label: string; onClick: () => void }` | Centered layout with icon, text, and optional CTA button. |
| `Skeleton.tsx` | `<Skeleton>` | `className` | `animate-pulse bg-aura rounded`. Use className for width/height. |

### Data Components (`components/data/`)

| File | Component | Key Props | Notes |
|---|---|---|---|
| `DataTable.tsx` | `<DataTable>` | `columns: Column[]`, `data: T[]`, `loading`, `emptyMessage`, `onRowClick?` | `Column = { key, header, render?, sortable? }`. Renders `<table>` with `thead/tbody`. Zebra rows: even rows get `bg-aura`. Loading state: skeleton rows. Empty state: uses `<EmptyState>`. |
| `StatCard.tsx` | `<StatCard>` | `icon: LucideIcon`, `label`, `value: string \| number`, `trend?: { value: number; positive: boolean }` | Uses `<Card hover>` internally. Icon in a purple-tinted circle. Value in `font-display text-2xl font-bold text-charcoal`. Label in `text-charcoal-muted text-sm`. |
| `StatusTimeline.tsx` | `<StatusTimeline>` | `events: { date: string; label: string; status: string }[]` | Vertical line with colored dots per status. |
| `Pagination.tsx` | `<Pagination>` | `page`, `totalPages`, `onPageChange` | Previous/Next buttons + page number pills. Disabled state for first/last page. |

### Form Components (`components/form/`)

| File | Component | Key Props | Notes |
|---|---|---|---|
| `FormField.tsx` | `<FormField>` | `label`, `error`, `required`, `children` | Wrapper: label + children + error message. Required indicator: red asterisk. |
| `FileUpload.tsx` | `<FileUpload>` | `accept`, `maxSizeMB`, `onFile`, `preview` | Dashed border drop zone. Shows thumbnail preview. Validates file size. |
| `DatePicker.tsx` | `<DatePicker>` | `label`, `value`, `onChange`, `error`, `minDate?` | Native `<input type="date">` styled like `<Input>`. |

### Feedback Components (`components/feedback/`)

| File | Component | Notes |
|---|---|---|
| `ConfirmDialog.tsx` | `<ConfirmDialog>` | Uses `<Modal>` internally. `title`, `message`, `onConfirm`, `onCancel`, `destructive?: boolean`. Destructive shows danger-styled confirm button. |
| `ErrorBoundary.tsx` | `<ErrorBoundary>` | React class component error boundary. Shows a fallback UI with "Something went wrong" message and a retry button. |

### Toast Setup

In `App.tsx`, add `<Toaster />` from Sonner with custom styling matching the design system. Use `toast.success()`, `toast.error()` throughout the app.

---

## 1.10 Layouts — `client/src/layouts/`

### `AuthLayout.tsx`
- Full-screen centered layout
- Background: `bg-aura`
- Content: centered Card with max-width, containing the auth form
- Top: app logo / title "Society Management"

### `DashboardLayout.tsx`
- Sidebar (left, fixed) + Topbar (top, sticky) + Content area (scrollable)
- Responsive: sidebar collapses on mobile, Topbar shows hamburger toggle
- Content area: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- Background: `bg-aura`

### `Sidebar.tsx`
- Sticky left sidebar, `w-64` on desktop, slide-over on mobile
- Background: `bg-white` with right border `border-orchid/10`
- Navigation items filtered by user role (see role matrix in plan)
- Active item: left accent bar (`w-1 h-6 bg-primary rounded-r-md`) + `bg-aura` background + `text-primary`
- Inactive item: `text-charcoal-muted hover:bg-aura hover:text-charcoal`
- Each nav item has a Lucide icon + label
- Logo/title at top

#### Sidebar Navigation Config:
```typescript
const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'committee', 'resident'] },
  { label: 'Residents', icon: Users, path: '/residents', roles: ['admin', 'committee'], children: [
    { label: 'Directory', path: '/residents', roles: ['admin', 'committee'] },
    { label: 'Onboard', path: '/residents/onboard', roles: ['admin'] },
  ]},
  { label: 'Units', icon: Building2, path: '/units', roles: ['admin'], children: [
    { label: 'All Units', path: '/units', roles: ['admin'] },
    { label: 'Create Unit', path: '/units/new', roles: ['admin'] },
  ]},
  { label: 'Committee', icon: Shield, path: '/committee', roles: ['admin', 'committee', 'resident'], children: [
    { label: 'Members', path: '/committee', roles: ['admin', 'committee', 'resident'] },
    { label: 'Assign', path: '/committee/assign', roles: ['admin'] },
  ]},
  { label: 'Announcements', icon: Megaphone, path: '/announcements', roles: ['admin', 'committee', 'resident'], children: [
    { label: 'Feed', path: '/announcements', roles: ['admin', 'committee', 'resident'] },
    { label: 'Create', path: '/announcements/new', roles: ['admin', 'committee'] },
  ]},
  { label: 'Complaints', icon: MessageSquareWarning, path: '/complaints', roles: ['admin', 'committee', 'resident'], children: [
    { label: 'All Complaints', path: '/complaints', roles: ['admin', 'committee', 'resident'] },
    { label: 'Lodge New', path: '/complaints/new', roles: ['resident'] },
  ]},
  { label: 'Service Requests', icon: Wrench, path: '/service-requests', roles: ['admin', 'committee', 'resident'], children: [
    { label: 'All Requests', path: '/service-requests', roles: ['admin', 'committee', 'resident'] },
    { label: 'Raise New', path: '/service-requests/new', roles: ['resident'] },
  ]},
  { label: 'Billing', icon: Receipt, path: '/billing', roles: ['admin'], children: [
    { label: 'All Bills', path: '/billing', roles: ['admin'] },
    { label: 'Generate', path: '/billing/generate', roles: ['admin'] },
  ]},
  { label: 'My Bills', icon: Receipt, path: '/my-bills', roles: ['resident'] },
  { label: 'Payments', icon: CreditCard, path: '/payments', roles: ['admin', 'committee'] },
  { label: 'Make Payment', icon: CreditCard, path: '/payments/new', roles: ['resident'] },
  { label: 'Defaulters', icon: AlertTriangle, path: '/reports/defaulters', roles: ['admin', 'committee'] },
  { label: 'Audit Logs', icon: ScrollText, path: '/audit-logs', roles: ['admin'] },
];
```

### `Topbar.tsx`
- Sticky top bar
- Left: hamburger menu (mobile only), page title / breadcrumb
- Right: user avatar + name + role badge, logout button
- Background: `bg-white` with bottom border `border-orchid/10`

---

## 1.11 Routing — `client/src/routes/`

### `ProtectedRoute.tsx`
- Wraps `<Outlet />`
- Checks `isAuthenticated` from auth store
- If `isLoading`, shows full-screen `<Spinner>`
- If not authenticated, redirects to `/login`

### `RoleGuard.tsx`
- Takes `allowedRoles: string[]` prop
- If user's role is not in the list, shows a "403 — Access Denied" page or redirects to `/dashboard`

### `index.tsx`
- Uses `createBrowserRouter` from React Router v7
- Structure:

```
/ → redirect to /dashboard
/login → AuthLayout > LoginPage
/register → AuthLayout > RegisterPage

(ProtectedRoute wrapper)
  /dashboard → DashboardLayout > DashboardPage
  /residents → DashboardLayout > RoleGuard[admin,committee] > ResidentsPage
  /residents/onboard → DashboardLayout > RoleGuard[admin] > OnboardResidentPage
  /units → DashboardLayout > RoleGuard[admin] > UnitsPage
  /units/new → DashboardLayout > RoleGuard[admin] > CreateUnitPage
  /committee → DashboardLayout > CommitteePage
  /committee/assign → DashboardLayout > RoleGuard[admin] > AssignCommitteePage
  /announcements → DashboardLayout > AnnouncementsPage
  /announcements/new → DashboardLayout > RoleGuard[admin,committee] > CreateAnnouncementPage
  /complaints → DashboardLayout > ComplaintsPage
  /complaints/new → DashboardLayout > RoleGuard[resident] > LodgeComplaintPage
  /complaints/:id → DashboardLayout > ComplaintDetailPage
  /service-requests → DashboardLayout > ServiceRequestsPage
  /service-requests/new → DashboardLayout > RoleGuard[resident] > RaiseRequestPage
  /service-requests/:id → DashboardLayout > RequestDetailPage
  /billing → DashboardLayout > RoleGuard[admin] > BillsPage
  /billing/generate → DashboardLayout > RoleGuard[admin] > GenerateBillsPage
  /billing/:id → DashboardLayout > BillDetailPage
  /my-bills → DashboardLayout > RoleGuard[resident] > MyBillsPage
  /payments → DashboardLayout > RoleGuard[admin,committee] > PaymentsPage
  /payments/new → DashboardLayout > RoleGuard[resident] > MakePaymentPage
  /reports/defaulters → DashboardLayout > RoleGuard[admin,committee] > DefaultersPage
  /audit-logs → DashboardLayout > RoleGuard[admin] > AuditLogsPage
```

> **For pages not yet built**, create simple placeholder components that export a `<div>` with the page name. This lets routing work from day one.

---

## 1.12 App Root — `client/src/App.tsx`

```tsx
// Wrap with RouterProvider
// Add <Toaster /> from Sonner
// On mount, call authStore.checkAuth() to verify session via GET /api/auth/me
```

---

## 1.13 Vite Proxy Config

Update [vite.config.ts](file:///d:/personal%20projects/society%20management/client/vite.config.ts) to proxy `/api` to the backend:

```typescript
server: {
  host: true,
  port: 5173,
  strictPort: true,
  watch: { usePolling: true },
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
},
```

---

## Files Created in This Module

```
client/.env
client/src/index.css                          (updated)
client/src/App.tsx                            (updated)
client/src/main.tsx                           (updated if needed)
client/index.html                             (updated — fonts + title)
client/vite.config.ts                         (updated — proxy)

client/src/lib/cn.ts
client/src/lib/formatCurrency.ts
client/src/lib/formatDate.ts

client/src/types/common.types.ts
client/src/types/auth.types.ts
client/src/types/resident.types.ts
client/src/types/billing.types.ts
client/src/types/complaint.types.ts
client/src/types/service-request.types.ts
client/src/types/announcement.types.ts
client/src/types/committee.types.ts

client/src/config/api.ts

client/src/stores/auth.store.ts
client/src/stores/ui.store.ts

client/src/hooks/useAuth.ts

client/src/components/ui/Button.tsx
client/src/components/ui/Input.tsx
client/src/components/ui/Textarea.tsx
client/src/components/ui/Select.tsx
client/src/components/ui/Badge.tsx
client/src/components/ui/Card.tsx
client/src/components/ui/Modal.tsx
client/src/components/ui/Avatar.tsx
client/src/components/ui/Spinner.tsx
client/src/components/ui/EmptyState.tsx
client/src/components/ui/Skeleton.tsx

client/src/components/data/DataTable.tsx
client/src/components/data/StatCard.tsx
client/src/components/data/StatusTimeline.tsx
client/src/components/data/Pagination.tsx

client/src/components/form/FormField.tsx
client/src/components/form/FileUpload.tsx
client/src/components/form/DatePicker.tsx

client/src/components/feedback/ConfirmDialog.tsx
client/src/components/feedback/ErrorBoundary.tsx

client/src/layouts/AuthLayout.tsx
client/src/layouts/DashboardLayout.tsx
client/src/layouts/Sidebar.tsx
client/src/layouts/Topbar.tsx

client/src/routes/index.tsx
client/src/routes/ProtectedRoute.tsx
client/src/routes/RoleGuard.tsx
```

---

## Verification

- `bun run build` compiles without errors
- Navigating to `/login` shows AuthLayout
- Navigating to `/dashboard` while unauthenticated redirects to `/login`
- All placeholder pages are reachable when authenticated
- Sidebar shows correct items per role
- Card components show "Aura Gate" hover effect
- Design tokens (colors, fonts) render correctly
