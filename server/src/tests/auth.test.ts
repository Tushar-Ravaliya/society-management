import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { Server } from "http";
import app from "../app";
import { db, connection } from "../db/db";
import { users } from "../db/schema";
import { like } from "drizzle-orm";

let server: Server;
const PORT = 4567;
const BASE_URL = `http://localhost:${PORT}`;

// Helper to extract cookies from headers
function getCookieValue(cookies: string[], name: string): string | null {
  for (const cookie of cookies) {
    if (cookie.startsWith(`${name}=`)) {
      return cookie.split(";")[0].split("=")[1];
    }
  }
  return null;
}

describe("Auth & RBAC Module Integration Tests", () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = "SecurePassword123";
  let accessTokenCookie: string | null = null;
  let refreshTokenCookie: string | null = null;

  beforeAll(async () => {
    // Start Express Server
    await new Promise<void>((resolve) => {
      server = app.listen(PORT, () => {
        resolve();
      });
    });

    // Cleanup existing test accounts
    await db.delete(users).where(like(users.email, "test_%@example.com"));
  }, 20000);

  afterAll(async () => {
    // Clean up created test user
    await db.delete(users).where(like(users.email, "test_%@example.com"));

    // Stop Server
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });

    // Close database connection
    await connection.end();
  }, 20000);

  test("POST /api/auth/register - Success", async () => {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: "Test Resident User",
        role: "resident",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe(testEmail);
    expect(body.data.user.role).toBe("resident");
  }, 20000);

  test("POST /api/auth/register - Conflict if email exists", async () => {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: "Duplicate User",
        role: "resident",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(409);
    expect(body.success).toBe(false);
    expect(body.error.message).toContain("Email is already registered");
  }, 20000);

  test("POST /api/auth/login - Success & Set-Cookies", async () => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe(testEmail);

    const setCookies = response.headers.getSetCookie();
    expect(setCookies.length).toBeGreaterThanOrEqual(2);

    accessTokenCookie = getCookieValue(setCookies, "accessToken");
    refreshTokenCookie = getCookieValue(setCookies, "refreshToken");

    expect(accessTokenCookie).not.toBeNull();
    expect(refreshTokenCookie).not.toBeNull();
  }, 20000);

  test("GET /api/auth/me - Success with valid access token", async () => {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Cookie: `accessToken=${accessTokenCookie}`,
      },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe(testEmail);
    expect(body.data.user.role).toBe("resident");
  }, 20000);

  test("GET /api/auth/me - Failure with missing / invalid token", async () => {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
    });

    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.message).toBe("Authentication required");
  }, 20000);

  test("POST /api/auth/refresh - Success & token rotation", async () => {
    // Wait slightly to ensure token timestamps differ if needed, though JWT rotation happens instantly
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${refreshTokenCookie}`,
      },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe(testEmail);

    const setCookies = response.headers.getSetCookie();
    const newAccessToken = getCookieValue(setCookies, "accessToken");
    const newRefreshToken = getCookieValue(setCookies, "refreshToken");

    expect(newAccessToken).not.toBeNull();
    expect(newRefreshToken).not.toBeNull();
    expect(newAccessToken).not.toBe(accessTokenCookie);
    expect(newRefreshToken).not.toBe(refreshTokenCookie);

    // Update tokens for subsequent tests
    accessTokenCookie = newAccessToken;
    refreshTokenCookie = newRefreshToken;
  }, 20000);

  test("POST /api/auth/logout - Invalidate cookies", async () => {
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${refreshTokenCookie}; accessToken=${accessTokenCookie}`,
      },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.message).toBe("Logged out successfully");

    const setCookies = response.headers.getSetCookie();
    const accessCookie = getCookieValue(setCookies, "accessToken");
    const refreshCookie = getCookieValue(setCookies, "refreshToken");

    // Cookies should be empty or expired
    expect(accessCookie === "" || accessCookie === null).toBe(true);
    expect(refreshCookie === "" || refreshCookie === null).toBe(true);
  }, 20000);
});
