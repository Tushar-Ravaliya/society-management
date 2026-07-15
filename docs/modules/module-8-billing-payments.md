# Module 8 — Billing & Payments

> Bills management, batch generation, payment recording (offline + Razorpay online), payment verification.
> **Depends on**: Module 1 (Foundation)

---

## 8.1 Billing API — `client/src/features/billing/api/billing.api.ts`

```typescript
export const billingApi = {
  generateBatch: (data: GenerateBatchPayload) =>
    api.post('/billing/generate-batch', data),

  getUnitBills: (unitId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/billing/unit/${unitId}`, { params }),

  getBillById: (id: string) =>
    api.get(`/billing/bills/${id}`),
};
```

### Types — `types/billing.types.ts`
```typescript
export interface Bill {
  id: string;
  billNumber: string;
  billingPeriod: string;
  maintenanceAmount: string;
  waterAmount: string;
  electricityAmount: string;
  penaltyAmount: string;
  otherAmount: string;
  totalAmount: string;
  status: 'unpaid' | 'paid' | 'partially_paid' | 'overdue';
  dueDate: string;
  unit?: {
    block: string;
    flatNumber: string;
  };
}

export interface GenerateBatchPayload {
  billingPeriod: string;
  dueDate: string;
  defaultMaintenance: number;
  defaultWater: number;
  defaultElectricity: number;
}
```

---

## 8.2 Payments API — `client/src/features/payments/api/payments.api.ts`

```typescript
export const paymentsApi = {
  getAll: (params: { page?: number; limit?: number; status?: string }) =>
    api.get('/payments', { params }),

  recordOffline: (data: RecordOfflinePayload) =>
    api.post('/payments/offline', data),

  createOnlineOrder: (data: { billId: string }) =>
    api.post('/payments/online/order', data),

  verifyOnlinePayment: (data: VerifyOnlinePayload) =>
    api.post('/payments/online/verify', data),

  verifyPayment: (id: string, data: VerifyPaymentPayload) =>
    api.patch(`/payments/${id}/verify`, data),
};
```

### Types
```typescript
export interface Payment {
  id: string;
  amount: string;
  transactionReference: string;
  status: 'pending' | 'verified' | 'failed';
  paymentMethod: 'online' | 'cash' | 'bank_transfer' | 'cheque';
  paymentDate: string;
  residentName: string;
  billNumber: string;
}

export interface RecordOfflinePayload {
  billId: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque';
  amount: number;
  transactionReference: string;
}

export interface VerifyOnlinePayload {
  billId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentPayload {
  status: 'verified' | 'failed';
  verificationNotes?: string;
}
```

---

## 8.3 Bills List (Admin) — `client/src/features/billing/pages/BillsPage.tsx`

### Route: `/billing`
### Access: Admin only

> **Note**: The backend doesn't have a `GET /api/billing` (list all bills) endpoint. Currently there's only `GET /api/billing/unit/:unitId`. You need to add a list-all endpoint for Admin.

### Backend Change Needed
Add `GET /api/billing?page=1&limit=10&status=&billingPeriod=`:
```typescript
// New route in billing.route.ts
router.get("/", authenticate, requireRoles(["admin"]), BillingController.getAllBills);
```

### Layout
- Page header: "Maintenance Bills" + "Generate Bills" button → `/billing/generate`
- Filter bar:
  - **Status** — `<Select>` with "All", "Unpaid", "Paid", "Overdue"
  - **Billing Period** — `<Input>` or `<Select>` (e.g., "Jul 2025")
- **BillsTable** using `<DataTable>`
- `<Pagination>`

### BillsTable Columns
- **Bill Number** — clickable → `/billing/:id`
- **Unit** — block + flat number
- **Period** — billing period
- **Total** — formatted currency
- **Status** — `<Badge>`: paid=success, unpaid=warning, overdue=danger
- **Due Date** — formatted date

---

## 8.4 Bill Detail — `client/src/features/billing/pages/BillDetailPage.tsx`

### Route: `/billing/:id`
### Access: Admin, Resident (resident must own the unit)

### Backend Endpoint
- `GET /api/billing/bills/:id` — returns bill with unit info and line-item breakdown

### Layout — BillBreakdown Component
- `<Card>` with:
  - **Bill Number** in header
  - **Unit**: Block-Flat
  - **Billing Period**
  - **Status Badge**
  - **Due Date**

- **Line-item breakdown table**:
  | Item | Amount |
  |---|---|
  | Maintenance | ₹X,XXX.XX |
  | Water | ₹XXX.XX |
  | Electricity | ₹XXX.XX |
  | Penalty | ₹XXX.XX |
  | Other | ₹XXX.XX |
  | **Total** | **₹X,XXX.XX** |

- If status is unpaid/overdue and user is resident: "Pay Now" button → `/payments/new?billId=xxx`

---

## 8.5 Generate Batch Bills — `client/src/features/billing/pages/GenerateBillsPage.tsx`

### Route: `/billing/generate`
### Access: Admin only

### Backend Endpoint
- `POST /api/billing/generate-batch`
- Body: `{ billingPeriod, dueDate, defaultMaintenance, defaultWater, defaultElectricity }`
- Generates bills for all occupied units for the given period (idempotent — skips already-generated)

### Form (GenerateBillsForm component)
- **Billing Period** — `<Input>` (required, e.g., "Jul 2025")
- **Due Date** — `<DatePicker>` (required)
- **Default Maintenance Amount** — `<Input type="number" step="0.01">` (required)
- **Default Water Amount** — `<Input type="number" step="0.01">` (required)
- **Default Electricity Amount** — `<Input type="number" step="0.01">` (required)
- **Submit** — `<Button variant="primary">Generate Bills</Button>`

### Behavior
- On success: `toast.success("Generated {count} bills for {period}")` → redirect to `/billing`
- If count is 0: `toast.info("No new bills generated — bills already exist for this period")`

---

## 8.6 My Bills (Resident) — `client/src/features/billing/pages/MyBillsPage.tsx`

### Route: `/my-bills`
### Access: Resident only

### Data Flow
1. Get current user's resident profile to find their `unitId`
   - This requires either the dashboard API (which returns unit info) or a new endpoint
   - **Simplest approach**: Store the user's unit info in the auth store (extend `/auth/me` response) or call the resident dashboard
2. Call `GET /api/billing/unit/:unitId` with the resident's unit ID

### Layout
- Page header: "My Bills"
- **BillsTable** with same columns as admin but without the "Unit" column
- Each row: clickable → `/billing/:id`
- Unpaid bills highlighted: row has subtle `bg-error/5` tint
- "Pay" action button on unpaid rows → `/payments/new?billId=xxx`

---

## 8.7 Payments List — `client/src/features/payments/pages/PaymentsPage.tsx`

### Route: `/payments`
### Access: Admin, Committee

### Backend Endpoint
- `GET /api/payments?page=1&limit=10&status=`
- Returns `{ payments: [...], pagination: {...} }`

### Layout
- Page header: "Payments"
- Filter bar:
  - **Status** — `<Select>` with "All", "Pending", "Verified", "Failed"
- **PaymentsTable** using `<DataTable>`
- `<Pagination>`

### PaymentsTable Columns
- **Bill Number** — linked to bill detail
- **Resident** — name
- **Amount** — formatted currency
- **Method** — `<Badge>`: online, cash, bank_transfer, cheque
- **Status** — `<Badge>`: pending=warning, verified=success, failed=danger
- **Date** — formatted date
- **Actions** (pending only): "Verify" button → opens `<VerifyPaymentModal>`

---

## 8.8 Make Payment — `client/src/features/payments/pages/MakePaymentPage.tsx`

### Route: `/payments/new?billId=xxx`
### Access: Resident only

### Layout
- Page header: "Make Payment"
- Bill summary card (fetch bill by ID from query param):
  - Bill number, period, total amount, status
- **Payment method tabs**: "Offline" | "Online (Razorpay)"

### Tab 1: Offline Payment (PaymentForm component)
- **Payment Method** — `<Select>` with "Cash", "Bank Transfer", "Cheque"
- **Amount** — `<Input type="number">` (pre-filled with bill total)
- **Transaction Reference** — `<Input>` (required, unique — receipt number, UTR, cheque number)
- **Submit** — `<Button variant="primary">Record Payment</Button>`

Behavior:
- Calls `POST /api/payments/offline`
- On success: `toast.success("Payment recorded. Awaiting admin verification.")` → redirect to `/my-bills`
- Creates a "pending" payment that Admin must verify

### Tab 2: Online Payment (Razorpay)
- **"Pay ₹{amount} with Razorpay"** button
- Flow:
  1. Click button → call `POST /api/payments/online/order` with `{ billId }`
  2. Receive `{ orderId, amount, currency, billNumber }`
  3. Open Razorpay checkout modal:
     ```javascript
     const options = {
       key: import.meta.env.VITE_RAZORPAY_KEY_ID,
       amount: order.amount,
       currency: order.currency,
       name: 'Society Management',
       description: `Bill: ${order.billNumber}`,
       order_id: order.orderId,
       handler: async (response) => {
         // Call verify endpoint
         await paymentsApi.verifyOnlinePayment({
           billId,
           razorpayPaymentId: response.razorpay_payment_id,
           razorpayOrderId: response.razorpay_order_id,
           razorpaySignature: response.razorpay_signature,
         });
         toast.success('Payment successful!');
         navigate('/my-bills');
       },
       prefill: {
         email: user.email,
       },
       theme: {
         color: '#6D28D9', // Primary purple
       },
     };

     const rzp = new window.Razorpay(options);
     rzp.open();
     ```
  4. On success: payment is instantly verified, bill marked as "paid"
  5. On failure: Razorpay shows its own error handling

### Razorpay Script
Add to `client/index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

And add type declaration for `window.Razorpay`:
```typescript
// client/src/types/razorpay.d.ts
declare interface Window {
  Razorpay: any;
}
```

---

## 8.9 Verify Payment Modal — `components/VerifyPaymentModal.tsx`

- `<Modal title="Verify Payment">`
- Shows payment details: amount, method, transaction reference, resident name
- **Action** — `<Select>` with "Verify" and "Reject"
- **Verification Notes** — `<Textarea>` (optional)
- **Submit** — `<Button variant="primary">` (or danger for reject)
- Calls `PATCH /api/payments/:id/verify` with `{ status, verificationNotes }`
- On success: `toast.success("Payment verified")` or `toast.success("Payment rejected")` → refetch list

---

## Backend Changes Needed

### 1. Add pagination to `BillingService.getUnitBills()`
Currently returns all bills without pagination. Add `page` and `limit` params:
```typescript
public static async getUnitBills(unitId: string, page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  // Add .limit(limit).offset(offset) to query
  // Add count query
  // Return { bills: [...], pagination: {...} }
}
```

### 2. Add `GET /api/billing` (list all bills for Admin)
New service method: `BillingService.getAllBills(filters)` with pagination, status/period filters.

### 3. Add `GET /api/units` (list all units for Admin)
Already mentioned in Module 4 — needed here for the onboard unit selector and bills context.

---

## Files Created

```
client/src/features/billing/api/billing.api.ts
client/src/features/billing/pages/BillsPage.tsx
client/src/features/billing/pages/BillDetailPage.tsx
client/src/features/billing/pages/GenerateBillsPage.tsx
client/src/features/billing/pages/MyBillsPage.tsx
client/src/features/billing/components/BillsTable.tsx
client/src/features/billing/components/BillBreakdown.tsx
client/src/features/billing/components/GenerateBillsForm.tsx

client/src/features/payments/api/payments.api.ts
client/src/features/payments/pages/PaymentsPage.tsx
client/src/features/payments/pages/MakePaymentPage.tsx
client/src/features/payments/components/PaymentsTable.tsx
client/src/features/payments/components/VerifyPaymentModal.tsx
client/src/features/payments/components/PaymentForm.tsx

client/src/types/billing.types.ts         (finalize)
client/src/types/razorpay.d.ts            (new)

client/index.html                          (add Razorpay script)
```

### Backend Changes
```
server/src/services/billing.service.ts     (add pagination to getUnitBills, add getAllBills)
server/src/controllers/billing.controller.ts (add getAllBills controller)
server/src/routes/billing.route.ts          (add GET /)
```

---

## Verification

- Admin navigates to `/billing` → sees all bills with filters + pagination
- Admin generates batch bills → success toast with count, bills appear
- Admin clicks a bill → detail page with line-item breakdown
- Resident navigates to `/my-bills` → sees their unit's bills
- Resident clicks "Pay" on unpaid bill → goes to payment page
- Resident records offline payment → "Pending" status, appears in admin payment list
- Resident pays via Razorpay → checkout modal opens, test payment succeeds, bill marked "paid"
- Admin navigates to `/payments` → sees all payments with verification queue
- Admin verifies pending payment → status "verified", bill "paid"
- Admin rejects payment → status "failed"
- Pagination works on all list pages
