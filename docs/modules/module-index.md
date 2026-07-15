# Frontend Modules — Master Index

> 9 modules

---

## Module Execution Order

| #   | Module                                                                                                                                                     |    Pages    |  Files   |                    Backend Changes                    | Status |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: | :------: | :---------------------------------------------------: | :----: |
| 1   | [Foundation](file:///C:/Users/tusha/.gemini/antigravity-ide/brain/a684d702-81ee-41ea-af6d-30fcab84e756/module-1-foundation.md)                             |      0      |   ~45    |                      Vite proxy                       |   ✅   |
| 2   | [Authentication](file:///C:/Users/tusha/.gemini/antigravity-ide/brain/a684d702-81ee-41ea-af6d-30fcab84e756/module-2-authentication.md)                     |      2      |    ~7    |                    CORS middleware                    |   ✅   |
| 3   | [Dashboards](file:///C:/Users/tusha/.gemini/antigravity-ide/brain/a684d702-81ee-41ea-af6d-30fcab84e756/module-3-dashboards.md)                             | 1 (3 views) |    ~5    |                         None                          |   ✅   |
| 4   | [Residents & Units](file:///C:/Users/tusha/.gemini/antigravity-ide/brain/a684d702-81ee-41ea-af6d-30fcab84e756/module-4-residents-units.md)                 |      4      |   ~10    |                 Add `GET /api/units`                  |   ✅   |
| 5   | [Committee & Announcements](file:///C:/Users/tusha/.gemini/antigravity-ide/brain/a684d702-81ee-41ea-af6d-30fcab84e756/module-5-committee-announcements.md) |      4      |   ~10    |                         None                          |   ✅   |
| 6   | [Complaints](file:///C:/Users/tusha/.gemini/antigravity-ide/brain/a684d702-81ee-41ea-af6d-30fcab84e756/module-6-complaints.md)                             |      3      |    ~8    |             Add `GET /api/complaints/:id`             |   ✅   |
| 7   | [Service Requests](file:///C:/Users/tusha/.gemini/antigravity-ide/brain/a684d702-81ee-41ea-af6d-30fcab84e756/module-7-service-requests.md)                 |      3      |    ~7    |          Add `GET /api/service-requests/:id`          |   ✅   |
| 8   | [Billing & Payments](file:///C:/Users/tusha/.gemini/antigravity-ide/brain/a684d702-81ee-41ea-af6d-30fcab84e756/module-8-billing-payments.md)               |      6      |   ~15    | Add `GET /api/billing`, pagination for `getUnitBills` |   ⬜   |
| 9   | [Reports, Audit & Polish](file:///C:/Users/tusha/.gemini/antigravity-ide/brain/a684d702-81ee-41ea-af6d-30fcab84e756/module-9-reports-audit-polish.md)      |      3      |    ~7    |                         None                          |   ⬜   |
|     | **Total**                                                                                                                                                  |   **27**    | **~114** |                                                       |        |

---

## Dependencies

```
Module 1 (Foundation) ← required by ALL other modules
Module 2 (Auth)       ← required by Modules 3-9 (auth must work first)
Modules 3-9           ← independent of each other (can be done in any order after 1+2)
```

---

## Backend Changes Tracker

| Change                                            | Module | Priority       |
| ------------------------------------------------- | ------ | -------------- |
| Add CORS middleware to `server/src/app.ts`        | 2      | 🔴 Required    |
| Add `GET /api/units` with pagination              | 4      | 🔴 Required    |
| Add `GET /api/complaints/:id`                     | 6      | 🟡 Recommended |
| Add `GET /api/service-requests/:id`               | 7      | 🟡 Recommended |
| Add `GET /api/billing` (list all for Admin)       | 8      | 🔴 Required    |
| Add pagination to `BillingService.getUnitBills()` | 8      | 🟡 Recommended |

---

## How to Use

1. Hand me one module file at a time
2. I will execute everything in that module
3. We verify it works before moving to the next
4. Backend changes in each module are done alongside the frontend

- [x] **Module 6: Complaints** ✅
  - Complaints list (scoped by role)
  - Lodge complaint (FormData w/ image upload)
  - Complaint detail (timeline, resolution)
  - Assign to committee modal
  - Resolve/Reject modal

- [x] **Module 7: Service Requests** ✅
  - Service requests list
  - Raise request (NOCs, bookings, etc.)
  - Request detail (timeline)
  - Process request modal (Approve, Reject, Complete)
