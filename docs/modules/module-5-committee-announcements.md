# Module 5 — Committee & Announcements

> Committee member management + announcements feed & creation.
> **Depends on**: Module 1 (Foundation)

---

## 5.1 Committee API — `client/src/features/committee/api/committee.api.ts`

```typescript
export const committeeApi = {
  getMembers: (activeOnly?: boolean) =>
    api.get('/committee', { params: { activeOnly } }),

  assign: (data: AssignCommitteeMemberPayload) =>
    api.post('/committee', data),

  update: (id: string, data: UpdateCommitteeMemberPayload) =>
    api.patch(`/committee/${id}`, data),
};
```

### Backend Endpoints
- `GET /api/committee?activeOnly=true` — returns array of committee members (no pagination — small list)
- `POST /api/committee` — assign a user as committee member
- `PATCH /api/committee/:id` — update designation, portfolio, or isActive

### Types — `types/committee.types.ts`
```typescript
export interface CommitteeMember {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  designation: string;
  portfolio: string;
  termStart: string;
  termEnd: string;
  isActive: boolean;
}

export interface AssignCommitteeMemberPayload {
  userId: string;
  designation: string;
  portfolio: string;
  termStart: string;
  termEnd: string;
}

export interface UpdateCommitteeMemberPayload {
  designation?: string;
  portfolio?: string;
  isActive?: boolean;
}
```

---

## 5.2 Committee Members Page — `client/src/features/committee/pages/CommitteePage.tsx`

### Route: `/committee`
### Access: All authenticated users (Admin can edit, others read-only)

### Layout
- Page header: "Committee Members"
  - Admin only: "Assign Member" button → `/committee/assign`
- **CommitteeList** component displaying members as cards (not a table — committee lists are typically small and visual)

### CommitteeList Component — `components/CommitteeList.tsx`
- Grid of `<Card hover>` components: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Each card shows:
  - `<Avatar name={member.name} size="lg" />` at the top
  - **Name** — `font-display text-lg font-semibold text-charcoal`
  - **Designation** — `text-primary font-medium` (e.g., "Chairman", "Secretary")
  - **Portfolio** — `text-charcoal-muted text-sm` (e.g., "Finance & Billing")
  - **Contact** — email + phone icons
  - **Term** — formatted date range (e.g., "Jan 2025 – Dec 2025")
  - **Status** — `<Badge variant="success">Active</Badge>` or `<Badge variant="neutral">Inactive</Badge>`
  - Admin only: "Edit" icon button → opens edit modal

### Edit Modal (Admin only)
- `<Modal title="Edit Committee Member">`
- Fields: Designation, Portfolio, isActive toggle
- Submit calls `committeeApi.update(id, data)`
- On success: `toast.success("Member updated")`, refetch list

### Empty State
- "No committee members assigned yet." + CTA for Admin to assign

---

## 5.3 Assign Committee Member — `client/src/features/committee/pages/AssignCommitteePage.tsx`

### Route: `/committee/assign`
### Access: Admin only

### Backend Endpoint
- `POST /api/committee` — body: `{ userId, designation, portfolio, termStart, termEnd }`
- Backend atomically: updates user role to "committee" + creates committee member record

### Form (AssignForm component)
- **User** — `<Select>` or text input for user ID
  - Ideally: search/select from active users not already in committee
  - The backend validates user exists and is active
- **Designation** — `<Input>` (required, e.g., "Chairman", "Treasurer", "Secretary")
- **Portfolio** — `<Input>` (required, e.g., "Finance & Billing", "Maintenance")
- **Term Start** — `<DatePicker>` (required)
- **Term End** — `<DatePicker>` (required, must be after term start)
- **Submit** — `<Button variant="primary">Assign Member</Button>`

### Behavior
- Validate with Zod
- On success: `toast.success("Committee member assigned")` → redirect to `/committee`
- On error (404 user not found, 400 user not active, 409 already member): toast error

---

## 5.4 Announcements API — `client/src/features/announcements/api/announcements.api.ts`

```typescript
export const announcementsApi = {
  getAll: (params: { page?: number; limit?: number }) =>
    api.get('/announcements', { params }),

  create: (data: CreateAnnouncementPayload) =>
    api.post('/announcements', data),

  delete: (id: string) =>
    api.delete(`/announcements/${id}`),
};
```

### Backend Endpoints
- `GET /api/announcements?page=1&limit=10` — paginated, audience-filtered by role, pinned first
- `POST /api/announcements` — Admin/Committee create
- `DELETE /api/announcements/:id` — Admin deletes any, Committee deletes own

### Types — `types/announcement.types.ts`
```typescript
export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: 'all' | 'residents' | 'committee';
  isPinned: boolean;
  expiresAt: string | null;
  createdAt: string;
  publishedBy: {
    id: string;
    name: string;
  };
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  audience: 'all' | 'residents' | 'committee';
  isPinned?: boolean;
  expiresAt?: string | null;
}
```

---

## 5.5 Announcements Feed — `client/src/features/announcements/pages/AnnouncementsPage.tsx`

### Route: `/announcements`
### Access: All authenticated users

### Layout
- Page header: "Announcements"
  - Admin/Committee: "Create Announcement" button → `/announcements/new`
- **AnnouncementCard** list, pinned announcements at the top (backend sorts by isPinned desc)
- `<Pagination>` at bottom

### AnnouncementCard Component — `components/AnnouncementCard.tsx`
- `<Card hover>` for each announcement
- Layout:
  - Top row: **Title** in `font-display text-lg font-semibold text-charcoal` + pin icon (📌) if pinned
  - **Content** — `text-charcoal text-sm` (full text or truncated with "Read more")
  - Bottom row:
    - **Published by** — `<Avatar size="sm">` + name
    - **Date** — relative time ("3 hours ago")
    - **Audience** — `<Badge>` showing "All", "Residents", "Committee"
    - Admin/Committee (own): **Delete** button → opens `<ConfirmDialog>`
- Pinned cards: subtle left border accent `border-l-4 border-primary`

### Delete Flow
- Click delete → `<ConfirmDialog destructive title="Delete Announcement" message="This cannot be undone.">`
- On confirm: call `announcementsApi.delete(id)` → `toast.success("Announcement deleted")` → refetch
- On error (403 — not owner and not admin): toast error

---

## 5.6 Create Announcement — `client/src/features/announcements/pages/CreateAnnouncementPage.tsx`

### Route: `/announcements/new`
### Access: Admin, Committee

### Form (AnnouncementForm component)
- **Title** — `<Input>` (required, max 255 chars)
- **Content** — `<Textarea rows={6}>` (required)
- **Audience** — `<Select>` with options:
  - "Everyone" (value: "all")
  - "Residents Only" (value: "residents")
  - "Committee Only" (value: "committee")
- **Pin this announcement** — checkbox/toggle (optional, default false)
- **Expires At** — `<DatePicker>` (optional, leave blank for no expiry)
- **Submit** — `<Button variant="primary">Publish Announcement</Button>`

### Behavior
- Validate with Zod
- On success: `toast.success("Announcement published")` → redirect to `/announcements`

---

## Files Created

```
client/src/features/committee/api/committee.api.ts
client/src/features/committee/pages/CommitteePage.tsx
client/src/features/committee/pages/AssignCommitteePage.tsx
client/src/features/committee/components/CommitteeList.tsx
client/src/features/committee/components/AssignForm.tsx

client/src/features/announcements/api/announcements.api.ts
client/src/features/announcements/pages/AnnouncementsPage.tsx
client/src/features/announcements/pages/CreateAnnouncementPage.tsx
client/src/features/announcements/components/AnnouncementCard.tsx
client/src/features/announcements/components/AnnouncementForm.tsx

client/src/types/committee.types.ts       (finalize)
client/src/types/announcement.types.ts    (finalize)
```

---

## Verification

- Navigate to `/committee` as any role → sees committee member cards
- Admin sees "Assign Member" button + edit icons on cards
- Resident/Committee sees read-only cards (no edit buttons)
- Assign a committee member → success toast, appears in list
- Edit a member (Admin) → modal opens, save updates the card
- Navigate to `/announcements` → feed renders with pinned items first
- Admin/Committee sees "Create Announcement" button
- Resident sees announcements but no create/delete buttons
- Create an announcement → appears at top of feed
- Delete an announcement → confirm dialog, removed from feed
- Pagination works on announcements feed
