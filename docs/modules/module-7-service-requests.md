# Module 7 — Service Requests

> Service requests list, raise request form, request detail with process actions.
> **Depends on**: Module 1 (Foundation)

---

## 7.1 Service Requests API — `client/src/features/service-requests/api/service-requests.api.ts`

```typescript
export const serviceRequestsApi = {
  getAll: (params: { page?: number; limit?: number; status?: string; type?: string }) =>
    api.get('/service-requests', { params }),

  raise: (data: RaiseServiceRequestPayload) =>
    api.post('/service-requests', data),

  process: (id: string, data: ProcessServiceRequestPayload) =>
    api.patch(`/service-requests/${id}`, data),
};
```

### Backend Endpoints
- `GET /api/service-requests?page=1&limit=10&status=&type=`
  - Role-scoped: residents see only their own
  - Returns `{ serviceRequests: [...], pagination: {...} }`
- `POST /api/service-requests` — Resident raises a request
- `PATCH /api/service-requests/:id` — Admin/Committee processes (approve/reject/complete)

### Types — `types/service-request.types.ts`
```typescript
export type ServiceRequestType = 'noc' | 'clubhouse_booking' | 'renovation_permission' | 'parking_allocation' | 'other';
export type ServiceRequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  requestType: ServiceRequestType;
  status: ServiceRequestStatus;
  preferredDate: string | null;
  adminRemarks: string | null;
  completedAt: string | null;
  createdAt: string;
  raisedBy: {
    name: string;
    flat: string | null;
  };
}

export interface RaiseServiceRequestPayload {
  title: string;
  description: string;
  requestType: ServiceRequestType;
  preferredDate?: string | null;
}

export interface ProcessServiceRequestPayload {
  status: ServiceRequestStatus;
  adminRemarks?: string | null;
}
```

### Display Labels for Request Types
```typescript
export const requestTypeLabels: Record<ServiceRequestType, string> = {
  noc: 'NOC',
  clubhouse_booking: 'Clubhouse Booking',
  renovation_permission: 'Renovation Permission',
  parking_allocation: 'Parking Allocation',
  other: 'Other',
};
```

---

## 7.2 Service Requests List — `client/src/features/service-requests/pages/ServiceRequestsPage.tsx`

### Route: `/service-requests`
### Access: All authenticated users (data scoped by role on backend)

### Layout
- Page header: "Service Requests"
  - Resident only: "Raise Request" button → `/service-requests/new`
- Filter bar:
  - **Status** — `<Select>` with "All", "Pending", "Approved", "Rejected", "Completed"
  - **Type** — `<Select>` with "All", "NOC", "Clubhouse Booking", "Renovation Permission", "Parking Allocation", "Other"
- **RequestTable** component using `<DataTable>`
- `<Pagination>` below

### RequestTable Component — `components/RequestTable.tsx`
Columns:
- **Title** — clickable, navigates to `/service-requests/:id`
- **Type** — `<Badge variant="info">` with human-readable label
- **Status** — `<Badge>`: pending=warning, approved=success, rejected=danger, completed=info
- **Raised By** — name + flat (Admin/Committee view)
- **Preferred Date** — formatted date or "—"
- **Date** — relative date of creation

---

## 7.3 Raise Service Request — `client/src/features/service-requests/pages/RaiseRequestPage.tsx`

### Route: `/service-requests/new`
### Access: Resident only

### Form (RaiseRequestForm component)
- **Title** — `<Input>` (required, max 255 chars)
- **Description** — `<Textarea rows={5}>` (required, describe the request in detail)
- **Request Type** — `<Select>` with options:
  - "NOC (No Objection Certificate)" → value: `noc`
  - "Clubhouse Booking" → value: `clubhouse_booking`
  - "Renovation Permission" → value: `renovation_permission`
  - "Parking Allocation" → value: `parking_allocation`
  - "Other" → value: `other`
- **Preferred Date** — `<DatePicker>` (optional, min date: tomorrow)
- **Submit** — `<Button variant="primary">Submit Request</Button>`

### Behavior
- Validate with Zod
- On success: `toast.success("Service request submitted")` → redirect to `/service-requests`
- On error: toast

---

## 7.4 Service Request Detail — `client/src/features/service-requests/pages/RequestDetailPage.tsx`

### Route: `/service-requests/:id`
### Access: All authenticated

> **Note**: Similar to complaints, the backend doesn't have a `GET /api/service-requests/:id` endpoint. You should add one.

### Backend Change Needed

Add `GET /api/service-requests/:id`:
```typescript
// In service-request.route.ts
router.get("/:id", authenticate, ServiceRequestController.getServiceRequestById);
```

### Layout
- Back link: "← Back to Service Requests"
- `<Card>` with full details:

#### Header
- **Title** in `font-display text-xl font-bold text-charcoal`
- **Status Badge** + **Type Badge**

#### Details
- **Description** — full text
- **Request Type** — human-readable label
- **Preferred Date** — formatted or "No preference"
- **Raised By** — name + flat
- **Submitted On** — formatted date

#### Admin Remarks (if any)
- Displayed in a subtle `bg-aura p-4 rounded-lg` box
- "Admin remarks: {text}"

#### Status Timeline
- `<StatusTimeline>` showing: Submitted → Approved/Rejected → Completed

### Action Buttons (Admin/Committee only)

If status is `pending`:
- **"Approve"** button → opens `<ProcessRequestModal>` with status pre-set to "approved"
- **"Reject"** button → opens `<ProcessRequestModal>` with status pre-set to "rejected"

If status is `approved`:
- **"Mark Completed"** button → opens `<ProcessRequestModal>` with status pre-set to "completed"

---

## 7.5 Process Request Modal — `components/ProcessRequestModal.tsx`

- `<Modal title="Process Service Request">`
- **Action** — pre-set based on button clicked, but can be changed: "Approve", "Reject", "Complete"
- **Admin Remarks** — `<Textarea rows={3}>` (optional but recommended)
- **Submit** — `<Button variant="primary">` (or danger for reject)
- On success: `toast.success("Request {status}")` → refetch detail
- On error: toast

---

## Backend Changes Needed

```
server/src/routes/service-request.route.ts     (add GET /:id)
server/src/controllers/service-request.controller.ts (add getServiceRequestById)
server/src/services/service-request.service.ts  (add getServiceRequestById)
```

---

## Files Created

```
client/src/features/service-requests/api/service-requests.api.ts
client/src/features/service-requests/pages/ServiceRequestsPage.tsx
client/src/features/service-requests/pages/RaiseRequestPage.tsx
client/src/features/service-requests/pages/RequestDetailPage.tsx
client/src/features/service-requests/components/RequestTable.tsx
client/src/features/service-requests/components/RaiseRequestForm.tsx
client/src/features/service-requests/components/ProcessRequestModal.tsx

client/src/types/service-request.types.ts   (finalize)
```

---

## Verification

- Navigate to `/service-requests` as Resident → sees own requests + "Raise Request" button
- Navigate as Admin → sees all requests, no "Raise" button
- Filter by status/type → table updates
- Pagination works
- Raise a service request → success, appears in list
- Click request title → detail page loads with full info
- Admin approves → status changes to "approved"
- Admin rejects → status "rejected" with admin remarks
- Admin marks approved request as completed → status "completed", completedAt set
- Committee can also process requests
- Status timeline reflects current state
