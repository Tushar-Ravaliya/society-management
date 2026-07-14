import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { Server } from "http";
import app from "../app";
import { db, connection } from "../db/db";
import { users, committeeMembers } from "../db/schema";
import { eq, like } from "drizzle-orm";
import bcrypt from "bcrypt";

let server: Server;
const PORT = 4569;
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

describe("Committee Management Module Integration Tests", () => {
  let adminCookie: string | null = null;
  let residentCookie: string | null = null;
  let candidateUserId: string;

  const adminEmail = `test_admin_${Date.now()}@example.com`;
  const residentEmail = `test_res_${Date.now()}@example.com`;
  const candidateEmail = `test_cand_${Date.now()}@example.com`;
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
    await db.delete(committeeMembers);
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

    // 2. Create standard Resident
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

    // 3. Create Candidate Resident User (the one who will be elected)
    const [candidate] = await db
      .insert(users)
      .values({
        email: candidateEmail,
        passwordHash,
        name: "Candidate Member",
        role: "resident",
        status: "active",
      })
      .returning();
    candidateUserId = candidate.id;
  }, 50000);

  afterAll(async () => {
    // Clean up test records
    await db.delete(committeeMembers);
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

  test("POST /api/committee - Failure as standard resident", async () => {
    const response = await fetch(`${BASE_URL}/api/committee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${residentCookie}`,
      },
      body: JSON.stringify({
        userId: candidateUserId,
        designation: "Secretary",
        portfolio: "Operations",
        termStart: "2026-01-01T00:00:00.000Z",
        termEnd: "2027-01-01T00:00:00.000Z",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error.message).toBe("Access denied");
  }, 20000);

  test("POST /api/committee - Success as Admin", async () => {
    const response = await fetch(`${BASE_URL}/api/committee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${adminCookie}`,
      },
      body: JSON.stringify({
        userId: candidateUserId,
        designation: "Secretary",
        portfolio: "Operations",
        termStart: "2026-01-01T00:00:00.000Z",
        termEnd: "2027-01-01T00:00:00.000Z",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.committeeMember.designation).toBe("Secretary");
    expect(body.data.committeeMember.portfolio).toBe("Operations");
    expect(body.data.committeeMember.isActive).toBe(true);

    // Verify candidate's user role updated to 'committee'
    const userRecords = await db.select().from(users).where(eq(users.id, candidateUserId)).limit(1);
    expect(userRecords[0].role).toBe("committee");
  }, 20000);

  test("POST /api/committee - Failure if already a member", async () => {
    const response = await fetch(`${BASE_URL}/api/committee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${adminCookie}`,
      },
      body: JSON.stringify({
        userId: candidateUserId,
        designation: "Treasurer",
        portfolio: "Finance",
        termStart: "2026-01-01T00:00:00.000Z",
        termEnd: "2027-01-01T00:00:00.000Z",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(409);
    expect(body.success).toBe(false);
    expect(body.error.message).toContain("User is already a committee member");
  }, 20000);

  test("GET /api/committee - Success for all roles", async () => {
    const response = await fetch(`${BASE_URL}/api/committee`, {
      method: "GET",
      headers: {
        Cookie: `accessToken=${residentCookie}`, // standard resident can access
      },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.committee.length).toBe(1);
    expect(body.data.committee[0].name).toBe("Candidate Member");
    expect(body.data.committee[0].designation).toBe("Secretary");
  }, 20000);

  test("PATCH /api/committee/:id - Success as Admin & role retention check", async () => {
    const response = await fetch(`${BASE_URL}/api/committee/${candidateUserId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${adminCookie}`,
      },
      body: JSON.stringify({
        designation: "Joint Secretary",
        portfolio: "Operations & Parking",
        isActive: false, // Mark inactive (term ends/resigned)
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.committeeMember.designation).toBe("Joint Secretary");
    expect(body.data.committeeMember.portfolio).toBe("Operations & Parking");
    expect(body.data.committeeMember.isActive).toBe(false);

    // Verify user role is NOT reverted to resident (keeps 'committee' role as requested)
    const userRecords = await db.select().from(users).where(eq(users.id, candidateUserId)).limit(1);
    expect(userRecords[0].role).toBe("committee");
  }, 20000);
});
