# Module 6 — Complaints

> Complaints list, lodge complaint with image upload, complaint detail with assign/resolve actions.
> **Depends on**: Module 1 (Foundation)

---

## 6.1 Complaints API — `client/src/features/complaints/api/complaints.api.ts`

```typescript
export const complaintsApi = {
  getAll: (params: { page?: number; limit?: number; status?: string; category?: string; priority?: string }) =>
    api.get('/complaints', { params }),

  lodge: (formData: FormData) =>
    api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  assign: (id: string, data: { assignedToId: string }) =>
    api.patch(`/complaints/${id}/assign`, data),

  resolve: (id: string, data: { status: 'resolved' | 'rejected'; resolutionDetails: string }) =>
    api.patch(`/complaints/${id}/resolve`, data),
};
```

### Backend Endpoints
- `GET /api/complaints?page=1&limit=10&status=&category=&priority=`
  - Role-scoped: residents see only their own, admin/committee see all
  - Returns `{ complaints: [...], pagination: {...} }`
- `POST /api/complaints` — multipart form data with optional image file
  - Access: Resident only
- `PATCH /api/complaints/:id/assign` — Admin assigns to committee/admin user
- `PATCH /api/complaints/:id/resolve` — Admin or assigned committee member resolves/rejects

### Types — `types/complaint.types.ts`
```typescript
export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'assigned' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  imageUrl: string | null;
  resolutionDetails: string | null;
  resolvedAt: string | null;
  createdAt: string;
  raisedBy: { id: string; name: string; email: string };
  assignedTo: { id: string; name: string; email: string } | null;
}

export interface LodgeComplaintPayload {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  image?: File;
}
```

---

## 6.2 Complaints List — `client/src/features/complaints/pages/ComplaintsPage.tsx`

### Route: `/complaints`
### Access: All authenticated users (data scoped by role on backend)

### Layout
- Page header: "Complaints"
  - Resident only: "Lodge Complaint" button → `/complaints/new`
- Filter bar:
  - **Status** — `<Select>` with "All", "Pending", "Assigned", "Resolved", "Rejected"
  - **Priority** — `<Select>` with "All", "Low", "Medium", "High"
  - **Category** — `<Select>` with common categories (e.g., "Plumbing", "Electrical", "Noise", "Parking", "Maintenance", "Other")
- **ComplaintTable** component using `<DataTable>`
- `<Pagination>` below

### ComplaintTable Component — `components/ComplaintTable.tsx`
Columns:
- **Title** — clickable, navigates to `/complaints/:id`
- **Category** — text
- **Priority** — `<Badge>`: high=danger, medium=warning, low=neutral
- **Status** — `<Badge>`: pending=warning, assigned=info, resolved=success, rejected=danger
- **Raised By** — name (Admin/Committee view only; resident sees their own)
- **Date** — formatted relative date
- **Image** — small indicator icon if `imageUrl` is not null

---

## 6.3 Lodge Complaint — `client/src/features/complaints/pages/LodgeComplaintPage.tsx`

### Route: `/complaints/new`
### Access: Resident only

### Form (ComplaintForm component)
- **Title** — `<Input>` (required, max 255 chars)
- **Description** — `<Textarea rows={5}>` (required)
- **Category** — `<Select>` with options: "Plumbing", "Electrical", "Noise", "Parking", "Maintenance", "Security", "Other"
- **Priority** — `<Select>` with "Low", "Medium", "High" (default: "Medium")
- **Image** — `<FileUpload accept="image/*" maxSizeMB={5}>` (optional)
  - Shows thumbnail preview when file selected
  - Backend uploads to ImageKit cloud storage
- **Submit** — `<Button variant="primary" loading={isSubmitting}>Submit Complaint</Button>`

### Behavior
- Build a `FormData` object (not JSON) because of file upload:
  ```typescript
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('category', data.category);
  formData.append('priority', data.priority);
  if (data.image) formData.append('image', data.image);
  ```
- On success: `toast.success("Complaint submitted")` → redirect to `/complaints`
- On error: toast with backend message

---

## 6.4 Complaint Detail — `client/src/features/complaints/pages/ComplaintDetailPage.tsx`

### Route: `/complaints/:id`
### Access: All authenticated (backend will return 404 if resident tries to access another's complaint)

> **Note**: The backend currently doesn't have a `GET /api/complaints/:id` endpoint. The complaint data can come from the list endpoint. Two options:
> 1. Add a `GET /api/complaints/:id` backend endpoint (recommended)
> 2. Find the complaint in the list data from the previous page (fragile)
>
> **Recommended**: Add a `getComplaintById` method to the backend.

### Layout
- Back link: "← Back to Complaints" → `/complaints`
- `<Card>` with full complaint details:

#### Header Section
  - **Title** in `font-display text-xl font-bold text-charcoal`
  - **Status Badge** + **Priority Badge**
  - **Date** — "Submitted on {formatted date}"

#### Details Section
  - **Description** — full text
  - **Category** — labeled field
  - **Raised By** — name + email (Admin/Committee view)
  - **Assigned To** — name + email (if assigned) or "Unassigned"

#### Image Section (if imageUrl exists)
  - Display the uploaded image (from ImageKit URL)
  - Clickable to open full-size in new tab

#### Resolution Section (if resolved/rejected)
  - **Resolution Details** — full text
  - **Resolved At** — formatted date

#### Status Timeline
  - `<StatusTimeline>` showing the lifecycle:
    - "Submitted" → "Assigned to {name}" → "Resolved" / "Rejected"

### Action Buttons (contextual)

#### Admin sees:
- If status === "pending": **"Assign"** button → opens `<AssignComplaintModal>`
- If status === "pending" or "assigned": **"Resolve"** / **"Reject"** buttons → opens `<ResolveComplaintModal>`

#### Committee sees (only if assigned to them):
- If status === "assigned" and `assignedTo.id === currentUser.id`: **"Resolve"** / **"Reject"** buttons

---

## 6.5 Assign Complaint Modal — `components/AssignComplaintModal.tsx`

- `<Modal title="Assign Complaint">`
- **Assign To** — `<Select>` or `<Input>` for user ID
  - Ideally: search/select from active admin + committee users
  - Backend validates: user must exist, be active, and have admin/committee role
- **Submit** — `<Button variant="primary">Assign</Button>`
- On success: `toast.success("Complaint assigned")` → refetch complaint detail
- On error: toast

---

## 6.6 Resolve Complaint Modal — `components/ResolveComplaintModal.tsx`

- `<Modal title="Resolve Complaint">` (or "Reject Complaint" based on intent)
- **Action** — `<Select>` with "Resolve" and "Reject"
- **Resolution Details** — `<Textarea rows={4}>` (required)
- **Submit** — `<Button variant="primary">Submit</Button>` (or danger variant for reject)
- On success: `toast.success("Complaint resolved")` / `toast.success("Complaint rejected")` → refetch
- On error: toast

---

## Backend Changes Needed

Add a `GET /api/complaints/:id` endpoint:

```typescript
// In complaint.route.ts
router.get("/:id", authenticate, ComplaintController.getComplaintById);

// In complaint.controller.ts
public static async getComplaintById(req, res, next) {
  // Fetch by ID, role-scope check (resident can only see own)
}

// In complaint.service.ts
public static async getComplaintById(id: string, userId: string, userRole: string) {
  // Query by ID with joins for raisedBy and assignedTo
  // If resident, verify raisedById === userId
}
```

---

## Files Created

```
client/src/features/complaints/api/complaints.api.ts
client/src/features/complaints/pages/ComplaintsPage.tsx
client/src/features/complaints/pages/LodgeComplaintPage.tsx
client/src/features/complaints/pages/ComplaintDetailPage.tsx
client/src/features/complaints/components/ComplaintTable.tsx
client/src/features/complaints/components/ComplaintForm.tsx
client/src/features/complaints/components/AssignComplaintModal.tsx
client/src/features/complaints/components/ResolveComplaintModal.tsx

client/src/types/complaint.types.ts       (finalize)
```

### Backend Changes
```
server/src/routes/complaint.route.ts          (add GET /:id)
server/src/controllers/complaint.controller.ts (add getComplaintById)
server/src/services/complaint.service.ts       (add getComplaintById)
```

---

## Verification

- Navigate to `/complaints` as Resident → sees only own complaints + "Lodge Complaint" button
- Navigate to `/complaints` as Admin → sees all complaints, no "Lodge" button
- Filter by status/priority/category → table updates
- Pagination works
- Lodge a complaint with image → success, appears in list
- Lodge a complaint without image → success
- Click a complaint title → detail page loads
- Admin assigns complaint → status changes to "assigned", assignee shown
- Admin/Committee resolves → status changes to "resolved", resolution details shown
- Admin rejects → status "rejected"
- Image displays on detail page (from ImageKit URL)
- Status timeline shows correct lifecycle events
