# Society Management System

This is a full-stack housing society management system built to streamline operations for housing societies. It provides tailored dashboards and robust tools for administrators, committee members, and residents. Core functionality includes unit and resident tracking, automated batch generation for maintenance billing, integrated online/offline payments, service request ticketing, and society-wide announcements. All critical actions are recorded via an immutable audit log.

## Techniques and Architecture

- **Feature-Based Architecture**: The [client/src/features](./client/src/features) directory encapsulates domain-specific logic (e.g., authentication, billing, complaints, payments), making the codebase modular and scalable.
- **Secure Authentication**: We use JWTs for authentication. The system employs a robust token rotation strategy with short-lived access tokens and long-lived refresh tokens securely managed via [HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies).
- **Responsive Layouts**: The application UI heavily relies on [Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout) and [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout) to build complex, responsive dashboards that adapt across devices.
- **End-to-End Validation**: We use declarative schema validation on both the client and server to ensure data integrity before it reaches the database.

## Technologies and Libraries

The tech stack relies on modern, performant tools suited for enterprise-grade applications.

- **[Bun](https://bun.sh/)**: A fast all-in-one JavaScript runtime, bundler, and package manager used to power the [server](./server) environment and manage dependencies.
- **[Drizzle ORM](https://orm.drizzle.team/)**: A lightweight, type-safe TypeScript ORM used to interface with the PostgreSQL database. You can find the schemas in [server/src/db](./server/src/db).
- **[Zustand](https://zustand-demo.pmnd.rs/)**: A minimalistic state management solution for React used to handle global application state.
- **[React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)**: Used in tandem for performant, flexible, and type-safe form validation without unnecessary re-renders.
- **[Razorpay](https://razorpay.com/)**: Integrated for processing online maintenance bill payments.
- **Fonts**: The UI typography utilizes [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) for headings and [Inter](https://fonts.google.com/specimen/Inter) for body text.

## Project Structure

```text
.
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── config/
│       ├── features/
│       ├── lib/
│       ├── stores/
│       └── types/
├── server/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── db/
│       ├── middlewares/
│       ├── routes/
│       ├── services/
│       └── validations/
└── docker-compose.yml
```

### Directory Details

- **`client/src/components`**: Contains reusable, generic UI components like buttons, inputs, selects, and modals.
- **`client/src/features`**: Houses domain-specific modules. Each feature folder contains its own components, hooks, API calls, and pages.
- **`client/src/stores`**: Contains Zustand global state stores, such as the authentication store.
- **`server/src/controllers`**: Express route handlers that process incoming HTTP requests and format responses.
- **`server/src/services`**: The core business logic layer. Controllers delegate complex operations (like generating batch bills) to these services.
- **`server/src/db`**: Contains the database connection setup, Drizzle ORM schemas, and database seeder scripts.

## Database Setup

The project uses PostgreSQL. Database initialization and migrations are handled via Drizzle ORM. 

When running the project via Docker, the schema is automatically pushed to the database on server startup. If you are starting with a fresh volume, you must run the database seeder to populate the initial demo users, units, and active committee members:

```bash
docker exec society-management-server bun run seed
```

This populates the database with default accounts: 
- **Admin**: `admin@society.com` (Password: `Password@123`)
- **Committee Member**: `committee@society.com` (Password: `Password@123`)
- **Resident**: `john@society.com` (Password: `Password@123`, linked to unit **A-101**)

## Environment Variables

Create a `.env` file in the `server` directory. Use `.env.example` as a reference.

```env
DATABASE_URL=postgresql://postgres:postgres_password@db:5432/society_management
PORT=3000
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
NODE_ENV=development
```

## Project Setup Instructions

### Using Docker (Recommended)

The easiest way to run the full stack (Frontend, Backend, and Database) is using Docker Compose.

1. Ensure Docker is running.
2. Clone the repository and configure the environment variables as described above.
3. Run the following command from the root directory:

```bash
docker compose up --build
```

The frontend will be available at `http://localhost:5173`. The backend API runs internally at `http://localhost:3000` (proxied automatically via Vite proxy configuration).

### Manual Local Setup

If you prefer to run the services outside of Docker:

1. Install [Bun](https://bun.sh/).
2. Start a local instance of PostgreSQL and update your `.env` `DATABASE_URL` to point to it.
3. Start the backend server:
   ```bash
   cd server
   bun install
   bun run dev
   ```
4. Start the frontend client:
   ```bash
   cd client
   bun install
   bun run dev
   ```

## API Documentation

The backend exposes a RESTful API. Below are all the resource endpoints available.

---

### 1. Authentication (`/api/auth`)

- **`POST /api/auth/register`**
  - Registers a new user.
  - Body: `{ email, password, name, phoneNumber }`
- **`POST /api/auth/login`**
  - Authenticates a user and issues `accessToken` and `refreshToken` HttpOnly cookies.
  - Body: `{ email, password }`
- **`POST /api/auth/refresh`**
  - Rotates the authentication tokens using the existing refresh token cookie.
- **`POST /api/auth/logout`**
  - Invalidates the active refresh token and clears auth cookies.
- **`GET /api/auth/me`**
  - Returns profile information and linked unit details of the authenticated user.
- **`GET /api/auth/users`** *(Admin only)*
  - Returns a list of active residents eligible for committee assignment.

---

### 2. Resident & Unit Management (`/api/residents` / `/api/units`)

- **`POST /api/units`** *(Admin only)*
  - Creates a new unit.
  - Body: `{ block, flatNumber, floor, bhkType }`
- **`GET /api/units`** *(Admin only)*
  - Retrieves all units.
- **`POST /api/residents/onboard`** *(Admin only)*
  - Registers and maps a resident to a unit.
  - Body: `{ email, name, phoneNumber, unitId, residencyType, vehicleNumber }`
- **`GET /api/residents`** *(Admin & Committee)*
  - Retrieves the resident directory.
  - Query Params: `?page=1&limit=10&search=john&block=A&residencyType=owner`

---

### 3. Committee Management (`/api/committee`)

- **`POST /api/committee`** *(Admin only)*
  - Assigns an active user to the managing committee.
  - Body: `{ userId, designation, portfolio, termStart, termEnd }`
- **`GET /api/committee`** *(Authenticated)*
  - Retrieves committee members.
  - Query Params: `?activeOnly=true`
- **`PATCH /api/committee/:id`** *(Admin only)*
  - Updates designation, portfolio, or status of a committee member.
  - Body: `{ designation, portfolio, isActive }`

---

### 4. Billing Management (`/api/billing`)

- **`POST /api/billing/generate-batch`** *(Admin only)*
  - Generates maintenance bills for all currently occupied units.
  - Body: `{ billingPeriod, dueDate, defaultMaintenance, defaultWater, defaultElectricity }`
- **`GET /api/billing`** *(Admin only)*
  - Retrieves all generated bills.
  - Query Params: `?page=1&limit=10&status=unpaid&billingPeriod=Sept+2025`
- **`GET /api/billing/unit/:unitId`** *(Authenticated)*
  - Retrieves bills associated with a specific unit. Residents are restricted to their linked unit.
- **`GET /api/billing/bills/:id`** *(Authenticated)*
  - Retrieves detailed information for a specific bill by ID.

---

### 5. Payment Management (`/api/payments`)

- **`POST /api/payments/offline`** *(Resident only)*
  - Records an offline payment (Cash, Cheque, Bank Transfer) waiting for verification.
  - Body: `{ billId, paymentMethod, amount, transactionReference }`
- **`POST /api/payments/online/order`** *(Resident only)*
  - Creates a Razorpay payment order.
  - Body: `{ billId, amount }`
- **`POST /api/payments/online/verify`** *(Resident only)*
  - Verifies the signature of a completed Razorpay payment order.
  - Body: `{ razorpayOrderId, razorpayPaymentId, razorpaySignature, billId }`
- **`PATCH /api/payments/:id/verify`** *(Admin & Committee)*
  - Verifies (approves/rejects) recorded offline payments.
  - Body: `{ status, verificationNotes }`
- **`GET /api/payments`** *(Authenticated)*
  - Retrieves recorded transactions list.

---

### 6. Complaints & Service Requests (`/api/complaints` / `/api/service-requests`)

- **`POST /api/complaints`** *(Resident only)*
  - Files a new complaint. Supports optional multipart image attachment.
  - Body: `{ title, description, category, priority }`
- **`PATCH /api/complaints/:id/assign`** *(Admin only)*
  - Assigns a complaint to a committee member or staff.
  - Body: `{ assignedToId }`
- **`PATCH /api/complaints/:id/resolve`** *(Admin & Committee)*
  - Marks a complaint as resolved.
  - Body: `{ resolutionDetails }`
- **`GET /api/complaints`** *(Authenticated)*
  - Lists complaints.
- **`POST /api/service-requests`** *(Resident only)*
  - Raises permissions/NOC requests.
  - Body: `{ title, description, requestType, preferredDate }`
- **`PATCH /api/service-requests/:id`** *(Admin & Committee)*
  - Approves or rejects a service request.
  - Body: `{ status, adminRemarks }`
- **`GET /api/service-requests`** *(Authenticated)*
  - Lists raised service requests.

---

### 7. Announcements (`/api/announcements`)

- **`POST /api/announcements`** *(Admin & Committee)*
  - Creates a notice.
  - Body: `{ title, content, audience, isPinned, expiresAt }`
- **`GET /api/announcements`** *(Authenticated)*
  - Retrieves announcements.
- **`DELETE /api/announcements/:id`** *(Admin & Committee)*
  - Deletes a notice.

---

### 8. Audit Logs & Reports (`/api/admin/audit-logs` / `/api/reports`)

- **`GET /api/admin/audit-logs`** *(Admin only)*
  - Retrieves tracking system audit logs.
- **`GET /api/reports/defaulters`** *(Admin & Committee)*
  - Generates list of units with overdue bills.
