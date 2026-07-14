import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { Server } from "http";
import app from "../app";
import { db, connection } from "../db/db";
import { users, units, residentProfiles, serviceRequests } from "../db/schema";
import { eq, like } from "drizzle-orm";
import bcrypt from "bcrypt";

let server: Server;
const PORT = 4572;
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

describe("Service Request Management Module Integration Tests", () => {
  let adminCookie: string | null = null;
  let committeeCookie: string | null = null;
  let residentCookie: string | null = null;
  
  let adminUserId: string;
  let committeeUserId: string;
  let residentUserId: string;

  let testRequestId: string;
  let testUnitId: string;

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
    await db.delete(serviceRequests);
    await db.delete(residentProfiles);
    await db.delete(units);
    await db.delete(users).where(like(users.email, "test_%@example.com"));

    const passwordHash = await bcrypt.hash(password, 10);

    // 1. Create Admin
    const [adminUser] = await db.insert(users).values({
      email: adminEmail,
      passwordHash,
      name: "Test Admin User",
      role: "admin",
      status: "active",
    }).returning();
    adminUserId = adminUser.id;

    const adminLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password }),
    });
    adminCookie = getCookieValue(adminLogin.headers.getSetCookie(), "accessToken");

    // 2. Create Committee Member
    const [committeeUser] = await db.insert(users).values({
      email: committeeEmail,
      passwordHash,
      name: "Test Committee User",
      role: "committee",
      status: "active",
    }).returning();
    committeeUserId = committeeUser.id;

    const commLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: committeeEmail, password }),
    });
    committeeCookie = getCookieValue(commLogin.headers.getSetCookie(), "accessToken");

    // 3. Create Resident
    const [residentUser] = await db.insert(users).values({
      email: residentEmail,
      passwordHash,
      name: "Test Resident User",
      role: "resident",
      status: "active",
    }).returning();
    residentUserId = residentUser.id;

    const resLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: residentEmail, password }),
    });
    residentCookie = getCookieValue(resLogin.headers.getSetCookie(), "accessToken");

    const [unit] = await db.insert(units).values({
      block: "A",
      flatNumber: "302",
      floor: 3,
      bhkType: "2BHK",
      status: "vacant",
    }).returning();
    testUnitId = unit.id;

    await db.insert(residentProfiles).values({
      id: residentUserId,
      unitId: testUnitId,
      residencyType: "owner",
    });

    // Update Unit status to occupied
    await db.update(units).set({ status: "occupied" }).where(eq(units.id, testUnitId));
  }, 50000);

  afterAll(async () => {
    // Clean up test records
    await db.delete(serviceRequests);
    await db.delete(residentProfiles);
    await db.delete(units);
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

  test("POST /api/service-requests - Success as resident", async () => {
    const response = await fetch(`${BASE_URL}/api/service-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${residentCookie}`,
      },
      body: JSON.stringify({
        title: "NOC for Passport Reissue",
        description: "Need an NOC certificate to update passport address.",
        requestType: "noc",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.serviceRequest.title).toBe("NOC for Passport Reissue");
    expect(body.data.serviceRequest.status).toBe("pending");
    expect(body.data.serviceRequest.requestType).toBe("noc");

    testRequestId = body.data.serviceRequest.id;
  }, 20000);

  test("POST /api/service-requests - Failure as Admin (Resident only)", async () => {
    const response = await fetch(`${BASE_URL}/api/service-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${adminCookie}`,
      },
      body: JSON.stringify({
        title: "Clubhouse booking",
        description: "Rent hall for session.",
        requestType: "clubhouse_booking",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
  }, 20000);

  test("PATCH /api/service-requests/:id - Failure as resident", async () => {
    const response = await fetch(`${BASE_URL}/api/service-requests/${testRequestId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${residentCookie}`,
      },
      body: JSON.stringify({
        status: "approved",
        adminRemarks: "Approved from my end.",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
  }, 20000);

  test("PATCH /api/service-requests/:id - Success as Admin (Approved)", async () => {
    const response = await fetch(`${BASE_URL}/api/service-requests/${testRequestId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${adminCookie}`,
      },
      body: JSON.stringify({
        status: "approved",
        adminRemarks: "NOC can be collected from block office during working hours.",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.serviceRequest.status).toBe("approved");
    expect(body.data.serviceRequest.adminRemarks).toContain("collected from block office");
  }, 20000);

  test("PATCH /api/service-requests/:id - Success as Committee (Completed)", async () => {
    const response = await fetch(`${BASE_URL}/api/service-requests/${testRequestId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${committeeCookie}`,
      },
      body: JSON.stringify({
        status: "completed",
        adminRemarks: "NOC issued and handed over.",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.serviceRequest.status).toBe("completed");
    expect(body.data.serviceRequest.completedAt).not.toBeNull();
  }, 20000);

  test("GET /api/service-requests - Scoped lists and resident flat details", async () => {
    // 1. Query requests as Resident (should return 1 request with flat details matching A-302)
    const resResponse = await fetch(`${BASE_URL}/api/service-requests`, {
      method: "GET",
      headers: { Cookie: `accessToken=${residentCookie}` },
    });
    const resBody = await resResponse.json();
    expect(resResponse.status).toBe(200);
    expect(resBody.data.serviceRequests.length).toBe(1);
    expect(resBody.data.serviceRequests[0].title).toBe("NOC for Passport Reissue");
    expect(resBody.data.serviceRequests[0].raisedBy.name).toBe("Test Resident User");
    expect(resBody.data.serviceRequests[0].raisedBy.flat).toBe("A-302"); // Verify concatenation formatting

    // 2. Query requests as Admin (should return the request)
    const adminResponse = await fetch(`${BASE_URL}/api/service-requests`, {
      method: "GET",
      headers: { Cookie: `accessToken=${adminCookie}` },
    });
    const adminBody = await adminResponse.json();
    expect(adminResponse.status).toBe(200);
    expect(adminBody.data.serviceRequests.length).toBe(1);
  }, 20000);
});
