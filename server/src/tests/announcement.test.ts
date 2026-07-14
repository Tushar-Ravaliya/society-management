import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { Server } from "http";
import app from "../app";
import { db, connection } from "../db/db";
import { users, announcements } from "../db/schema";
import { eq, like } from "drizzle-orm";
import bcrypt from "bcrypt";

let server: Server;
const PORT = 4570;
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

describe("Announcements Module Integration Tests", () => {
  let adminCookie: string | null = null;
  let committeeCookie: string | null = null;
  let residentCookie: string | null = null;

  let committeeAnnouncementId: string;
  let adminAnnouncementId: string;

  const adminEmail = `test_admin_${Date.now()}@example.com`;
  const committeeEmail = `test_comm_${Date.now()}@example.com`;
  const residentEmail = `test_res_${Date.now()}@example.com`;
  const password = "SecurePassword123";

  beforeAll(async () => {
    // Ping DB first to wake up Neon Postgres if it was scaled to zero
    await db.select().from(users).limit(1);

    // Start Express Server
    await new Promise<void>((resolve, reject) => {
      server = app.listen(PORT, () => {
        resolve();
      });
      server.on("error", (err) => {
        reject(err);
      });
    });

    // Cleanup existing test records
    await db.delete(announcements);
    await db.delete(users).where(like(users.email, "test_%@example.com"));

    const passwordHash = await bcrypt.hash(password, 10);

    // 1. Create Admin
    await db.insert(users).values({
      email: adminEmail,
      passwordHash,
      name: "Test Admin User",
      role: "admin",
      status: "active",
    });

    const adminLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password }),
    });
    adminCookie = getCookieValue(adminLogin.headers.getSetCookie(), "accessToken");

    // 2. Create Committee Member
    await db.insert(users).values({
      email: committeeEmail,
      passwordHash,
      name: "Test Committee User",
      role: "committee",
      status: "active",
    });

    const commLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: committeeEmail, password }),
    });
    committeeCookie = getCookieValue(commLogin.headers.getSetCookie(), "accessToken");

    // 3. Create Resident
    await db.insert(users).values({
      email: residentEmail,
      passwordHash,
      name: "Test Resident User",
      role: "resident",
      status: "active",
    });

    const resLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: residentEmail, password }),
    });
    residentCookie = getCookieValue(resLogin.headers.getSetCookie(), "accessToken");
  }, 50000);

  afterAll(async () => {
    // Clean up test records
    await db.delete(announcements);
    await db.delete(users).where(like(users.email, "test_%@example.com"));

    // Stop Server
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });

    // Close database connection
    await connection.end();
  }, 50000);

  test("POST /api/announcements - Failure as resident", async () => {
    const response = await fetch(`${BASE_URL}/api/announcements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${residentCookie}`,
      },
      body: JSON.stringify({
        title: "Garbage collection changes",
        content: "Garbage will be collected at 8 AM instead of 9 AM.",
        audience: "all",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
  }, 20000);

  test("POST /api/announcements - Success as Committee Member (Target: residents)", async () => {
    const response = await fetch(`${BASE_URL}/api/announcements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${committeeCookie}`,
      },
      body: JSON.stringify({
        title: "Clubhouse repairs scheduled",
        content: "Clubhouse will be closed on Friday for paint repairs.",
        audience: "residents",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.announcement.title).toBe("Clubhouse repairs scheduled");
    expect(body.data.announcement.audience).toBe("residents");

    committeeAnnouncementId = body.data.announcement.id;
  }, 20000);

  test("POST /api/announcements - Success as Admin (Target: committee)", async () => {
    const response = await fetch(`${BASE_URL}/api/announcements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${adminCookie}`,
      },
      body: JSON.stringify({
        title: "Confidential Committee Meeting",
        content: "Discussion regarding yearly maintenance budget allocation.",
        audience: "committee",
        isPinned: true,
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.announcement.title).toBe("Confidential Committee Meeting");
    expect(body.data.announcement.audience).toBe("committee");

    adminAnnouncementId = body.data.announcement.id;
  }, 20000);

  test("GET /api/announcements - Resident feed audience restriction", async () => {
    const response = await fetch(`${BASE_URL}/api/announcements`, {
      method: "GET",
      headers: { Cookie: `accessToken=${residentCookie}` },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    
    // Residents should see the committeeAnnouncement (audience: 'residents')
    // but not the adminAnnouncement (audience: 'committee')
    const titles = body.data.announcements.map((a: any) => a.title);
    expect(titles).toContain("Clubhouse repairs scheduled");
    expect(titles).not.toContain("Confidential Committee Meeting");
  }, 20000);

  test("GET /api/announcements - Committee Member feed targeted access", async () => {
    const response = await fetch(`${BASE_URL}/api/announcements`, {
      method: "GET",
      headers: { Cookie: `accessToken=${committeeCookie}` },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    
    // Committee members should see both announcements
    const titles = body.data.announcements.map((a: any) => a.title);
    expect(titles).toContain("Clubhouse repairs scheduled");
    expect(titles).toContain("Confidential Committee Meeting");

    // Pinned notice should be ordered first
    expect(body.data.announcements[0].title).toBe("Confidential Committee Meeting");
  }, 20000);

  test("GET /api/announcements - Filter out expired announcements", async () => {
    const pastDate = new Date();
    pastDate.setHours(pastDate.getHours() - 1); // 1 hour ago (expired)

    // Admin creates expired announcement
    await db.insert(announcements).values({
      title: "Expired Notice",
      content: "This notice should be hidden.",
      audience: "all",
      expiresAt: pastDate,
      publishedById: (await db.select().from(users).where(eq(users.email, adminEmail)).limit(1))[0].id,
    });

    const response = await fetch(`${BASE_URL}/api/announcements`, {
      method: "GET",
      headers: { Cookie: `accessToken=${adminCookie}` },
    });

    const body = await response.json();
    const titles = body.data.announcements.map((a: any) => a.title);
    expect(titles).not.toContain("Expired Notice");
  }, 20000);

  test("DELETE /api/announcements/:id - Committee Member cannot delete Admin's announcement", async () => {
    const response = await fetch(`${BASE_URL}/api/announcements/${adminAnnouncementId}`, {
      method: "DELETE",
      headers: { Cookie: `accessToken=${committeeCookie}` },
    });

    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error.message).toBe("Access denied to delete this announcement");
  }, 20000);

  test("DELETE /api/announcements/:id - Committee Member can delete own announcement", async () => {
    const response = await fetch(`${BASE_URL}/api/announcements/${committeeAnnouncementId}`, {
      method: "DELETE",
      headers: { Cookie: `accessToken=${committeeCookie}` },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  }, 20000);

  test("DELETE /api/announcements/:id - Admin can delete any announcement", async () => {
    const response = await fetch(`${BASE_URL}/api/announcements/${adminAnnouncementId}`, {
      method: "DELETE",
      headers: { Cookie: `accessToken=${adminCookie}` },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  }, 20000);
});
