# Module 2 — Authentication

> Login and Register pages, auth API layer, cookie-based flow.
> **Depends on**: Module 1 (Foundation)

---

## 2.1 Auth API — `client/src/features/auth/api/auth.api.ts`

```typescript
import { api } from "@/config/api";
import type { LoginPayload, RegisterPayload, User } from "@/types/auth.types";
import type { ApiResponse } from "@/types/common.types";

export const authApi = {
  login: (data: LoginPayload) =>
    api.post<ApiResponse<{ user: User }>>("/auth/login", data),

  register: (data: RegisterPayload) =>
    api.post<ApiResponse<{ user: User }>>("/auth/register", data),

  refresh: () => api.post<ApiResponse<{ user: User }>>("/auth/refresh"),

  logout: () => api.post<ApiResponse<{ message: string }>>("/auth/logout"),

  me: () => api.get<ApiResponse<{ user: User }>>("/auth/me"),
};
```

---

## 2.2 Login Page — `client/src/features/auth/pages/LoginPage.tsx`

### Route: `/login`

### Layout

- Uses `AuthLayout` (centered card on `bg-aura` background)
- Card header: app title "Society Management" in `font-display text-2xl font-bold text-charcoal`
- Subtitle: "Sign in to your account" in `text-charcoal-muted`

### Form (LoginForm component)

- **Email** field — `<Input type="email">` with validation (required, valid email format)
- **Password** field — `<Input type="password">` with validation (required, min 6 chars)
- **Submit button** — `<Button variant="primary" loading={isSubmitting}>Sign in</Button>`
- **Link** to register page: "Don't have an account? Register" → navigates to `/register`

### Behavior

- Use `react-hook-form` + `zod` for form validation
- On submit: call `authApi.login()` → on success, `authStore.setUser(user)` → redirect to `/dashboard`
- On error: show `toast.error()` with the error message from backend
- If already authenticated, redirect to `/dashboard`

### Backend endpoint

- `POST /api/auth/login` — body: `{ email, password }`
- Response sets httpOnly cookies: `accessToken` (15min), `refreshToken` (7 days)
- Returns: `{ success: true, data: { user: { id, email, role } } }`

---

## 2.3 Auth Store Integration

Update `auth.store.ts` `checkAuth` to:

1. Call `authApi.me()`
2. If success → `setUser(user)`, `isAuthenticated = true`
3. If 401 → try `authApi.refresh()`, if success → retry `me()`, else `logout()`

This runs on app mount in `App.tsx`.

---

## 2.4 Backend CORS Setup

The backend at [app.ts](file:///d:/personal%20projects/society%20management/server/src/app.ts) needs CORS to allow the frontend origin with credentials:

```typescript
import cors from "cors";

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
```

> **Backend change needed**: Install `cors` package and add this middleware before routes. Without it, cookies won't be sent cross-origin.

```bash
cd server
bun add cors
bun add -d @types/cors
```

---

## Files Created/Modified

```
# New files
client/src/features/auth/api/auth.api.ts
client/src/features/auth/pages/LoginPage.tsx
client/src/features/auth/components/LoginForm.tsx

# Modified files
client/src/routes/index.tsx              (wire up login)
client/src/stores/auth.store.ts          (implement checkAuth flow)
client/src/App.tsx                       (call checkAuth on mount)

# Backend changes
server/src/app.ts                        (add CORS middleware)
server/package.json                      (add cors dependency)
```

---

## Verification

- Navigate to `/login` — form renders with email + password fields
- Submit with invalid data — validation errors appear inline
- Submit with valid credentials — redirects to `/dashboard`, cookies are set
- Refresh the page while logged in — session persists (checkAuth works)
- Click logout in topbar — cookies cleared, redirected to `/login`
- Navigate to `/dashboard` while logged out — redirected to `/login`
