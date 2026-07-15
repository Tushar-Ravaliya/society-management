# Module 4 — Residents & Units

> Residents directory, onboard resident form, units list, create unit form.
> **Depends on**: Module 1 (Foundation)

---

## 4.1 API Layer

### `client/src/features/residents/api/residents.api.ts`

```typescript
export const residentsApi = {
  getDirectory: (params: { page?: number; limit?: number; search?: string; block?: string; residencyType?: string }) =>
    api.get('/residents', { params }),

  onboard: (data: OnboardResidentPayload) =>
    api.post('/residents/onboard', data),
};
```

### `client/src/features/units/api/units.api.ts`

```typescript
export const unitsApi = {
  create: (data: CreateUnitPayload) =>
    api.post('/units', data),

  // Note: There's no GET /api/units endpoint in the backend yet.
  // You'll need to add one for the Units List page, OR use the
  // resident directory data which includes unit info.
};
```

> **Backend consideration**: The backend currently has `POST /api/units` to create units but no `GET /api/units` to list all units. You may need to add a `GET /api/units` endpoint with pagination for the UnitsPage. Alternatively, skip the Units List page for now and manage units only through the onboard flow.

---

## 4.2 Residents Directory — `client/src/features/residents/pages/ResidentsPage.tsx`

### Route: `/residents`
### Access: Admin, Committee

### Backend Endpoint
- `GET /api/residents?page=1&limit=10&search=&block=&residencyType=`
- Returns: `{ residents: [...], pagination: { total, page, limit, totalPages } }`

### Layout
- Page header: "Residents Directory" + "Onboard Resident" button (Admin only) → `/residents/onboard`
- Filter bar:
  - **Search** — `<Input>` with search icon, debounced (300ms), searches name/email
  - **Block** — `<Select>` dropdown (options populated from data or hardcoded)
  - **Residency Type** — `<Select>` with "All", "Owner", "Tenant"
- `<DataTable>` with columns:
  - **Name** — `residents[].name`
  - **Email** — `residents[].email`
  - **Phone** — `residents[].phoneNumber`
  - **Unit** — `residents[].unit.block + "-" + residents[].unit.flatNumber`
  - **Type** — `<Badge>` showing owner/tenant
  - **Vehicle** — `residents[].vehicleNumber` (or "—")
- `<Pagination>` below table

### Styling
- Filters in a `flex flex-wrap gap-4` row
- Table uses zebra rows (`bg-aura` on even rows)
- Responsive: on mobile, table scrolls horizontally

---

## 4.3 Onboard Resident — `client/src/features/residents/pages/OnboardResidentPage.tsx`

### Route: `/residents/onboard`
### Access: Admin only

### Backend Endpoint
- `POST /api/residents/onboard`
- Body: `{ email, name, unitId, residencyType, phoneNumber?, vehicleNumber? }`
- The backend creates a user with `status: "pending"` and a random temporary password

### Form (OnboardForm component)
- **Name** — `<Input>` (required)
- **Email** — `<Input type="email">` (required)
- **Phone Number** — `<Input type="tel">` (optional)
- **Unit** — `<Select>` dropdown of vacant units (need to fetch or let user input unit ID)
  - Ideally: fetch vacant units from a `GET /api/units?status=vacant` endpoint
  - Fallback: text input for unit ID
- **Residency Type** — `<Select>` with "Owner" and "Tenant"
- **Vehicle Number** — `<Input>` (optional)
- **Submit** — `<Button variant="primary">Onboard Resident</Button>`

### Behavior
- Validate with Zod schema
- On success: `toast.success("Resident onboarded successfully")` → redirect to `/residents`
- On error (409 email exists, 404 unit not found, 400 unit occupied): show toast with backend message

---

## 4.4 Units List — `client/src/features/units/pages/UnitsPage.tsx`

### Route: `/units`
### Access: Admin only

> **Note**: This page requires a `GET /api/units` backend endpoint that doesn't exist yet. You need to add it.

### Backend Change Needed

Add to [resident.route.ts](file:///d:/personal%20projects/society%20management/server/src/routes/resident.route.ts) (or a new `unit.route.ts`):

```typescript
unitRouter.get(
  "/",
  authenticate,
  requireRoles(["admin"]),
  ResidentController.getUnits  // New controller method
);
```

Add to `ResidentService`:
```typescript
public static async getUnits(filters: { status?: string; block?: string; page: number; limit: number }) {
  // Similar pattern: query units table with pagination
}
```

### Layout
- Page header: "Units" + "Create Unit" button → `/units/new`
- Filter bar:
  - **Block** — `<Select>` filter
  - **Status** — `<Select>` with "All", "Occupied", "Vacant"
- `<DataTable>` with columns:
  - **Block** — `units[].block`
  - **Flat Number** — `units[].flatNumber`
  - **Floor** — `units[].floor`
  - **BHK Type** — `units[].bhkType`
  - **Status** — `<Badge variant="success">Occupied</Badge>` or `<Badge variant="neutral">Vacant</Badge>`
- `<Pagination>` below table

---

## 4.5 Create Unit — `client/src/features/units/pages/CreateUnitPage.tsx`

### Route: `/units/new`
### Access: Admin only

### Backend Endpoint
- `POST /api/units`
- Body: `{ block, flatNumber, floor, bhkType }`

### Form (CreateUnitForm component)
- **Block** — `<Input>` (required, e.g., "A", "B", "Tower-1")
- **Flat Number** — `<Input>` (required, e.g., "101", "A-101")
- **Floor** — `<Input type="number">` (required)
- **BHK Type** — `<Select>` with options: "1BHK", "2BHK", "3BHK", "4BHK", "Studio"
- **Submit** — `<Button variant="primary">Create Unit</Button>`

### Behavior
- Validate with Zod schema
- On success: `toast.success("Unit created")` → redirect to `/units`
- On error (409 flat exists): show toast

---

## Files Created

```
client/src/features/residents/api/residents.api.ts
client/src/features/residents/pages/ResidentsPage.tsx
client/src/features/residents/pages/OnboardResidentPage.tsx
client/src/features/residents/components/ResidentTable.tsx
client/src/features/residents/components/OnboardForm.tsx

client/src/features/units/api/units.api.ts
client/src/features/units/pages/UnitsPage.tsx
client/src/features/units/pages/CreateUnitPage.tsx
client/src/features/units/components/UnitTable.tsx
client/src/features/units/components/CreateUnitForm.tsx
```

### Backend Changes
```
server/src/routes/resident.route.ts     (add GET /api/units with pagination)
server/src/controllers/resident.controller.ts  (add getUnits method)
server/src/services/resident.service.ts  (add getUnits service method)
```

---

## Verification

- Navigate to `/residents` as Admin → table renders with pagination
- Search by name → results filter live (debounced)
- Filter by block/residency type → table updates
- Navigate to `/residents/onboard` → form renders
- Onboard a resident → success toast, redirects to directory
- Navigate to `/units` → lists all units
- Filter by status (vacant/occupied) → table filters
- Create a new unit → success toast, redirects to units list
- Try accessing `/residents/onboard` as Committee → access denied
- Try accessing `/units` as Resident → access denied
