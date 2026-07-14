import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { Server } from "http";
import app from "../app";
import { db, connection } from "../db/db";
import { users, units, residentProfiles } from "../db/schema";
import { eq, like } from "drizzle-orm";
import bcrypt from "bcrypt";

let server: Server;
const PORT = 4568;
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

describe("Resident Management Module Integration Tests", () => {
  let adminCookie: string | null = null;
  let residentCookie: string | null = null;
  let targetUnitId: string;
  
  const adminEmail = `test_admin_${Date.now()}@example.com`;
  const residentEmail = `test_res_${Date.now()}@example.com`;
  const onboardEmail = `test_onboard_${Date.now()}@example.com`;
  const password = "SecurePassword123";

  beforeAll(async () => {
    // Start Express Server
    await new Promise<void>((resolve, reject) => {
      server = app.listen(PORT, () => {
        resolve();
      });
      server.on("error", (err) => {
        reject(err);
      });
    });

    // Cleanup existing test accounts
    await db.delete(residentProfiles);
    await db.delete(units);
    await db.delete(users).where(like(users.email, "test_%@example.com"));

    // 1. Register and Login Admin
    const passwordHash = await bcrypt.hash(password, 10);
    const [adminUser] = await db
      .insert(users)
      .values({
        email: adminEmail,
        passwordHash,
        name: "Test Admin User",
        role: "admin",
        status: "active",
      })
      .returning();

    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password }),
    });
    const adminSetCookies = adminLoginRes.headers.getSetCookie();
    adminCookie = getCookieValue(adminSetCookies, "accessToken");

    // 2. Register and Login a standard Resident
    const [residentUser] = await db
      .insert(users)
      .values({
        email: residentEmail,
        passwordHash,
        name: "Test Resident User",
        role: "resident",
        status: "active",
      })
      .returning();

    const resLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: residentEmail, password }),
    });
    const resSetCookies = resLoginRes.headers.getSetCookie();
    residentCookie = getCookieValue(resSetCookies, "accessToken");
  }, 20000);

  afterAll(async () => {
    // Cleanup
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
  }, 20000);

  test("POST /api/units - Failure as standard resident", async () => {
    const response = await fetch(`${BASE_URL}/api/units`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${residentCookie}`,
      },
      body: JSON.stringify({
        block: "B",
        flatNumber: "101",
        floor: 1,
        bhkType: "2BHK",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error.message).toBe("Access denied");
  }, 20000);

  test("POST /api/units - Success as Admin", async () => {
    const response = await fetch(`${BASE_URL}/api/units`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${adminCookie}`,
      },
      body: JSON.stringify({
        block: "B",
        flatNumber: "101",
        floor: 1,
        bhkType: "2BHK",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.unit.block).toBe("B");
    expect(body.data.unit.flatNumber).toBe("101");
    expect(body.data.unit.status).toBe("vacant");

    targetUnitId = body.data.unit.id;
  }, 20000);

  test("POST /api/units - Failure on duplicate block + flat creation", async () => {
    const response = await fetch(`${BASE_URL}/api/units`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${adminCookie}`,
      },
      body: JSON.stringify({
        block: "B",
        flatNumber: "101",
        floor: 1,
        bhkType: "2BHK",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(409);
    expect(body.success).toBe(false);
    expect(body.error.message).toContain("Flat already exists in this block");
  }, 20000);

  test("POST /api/residents/onboard - Success as Admin", async () => {
    const response = await fetch(`${BASE_URL}/api/residents/onboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${adminCookie}`,
      },
      body: JSON.stringify({
        email: onboardEmail,
        name: "John Onboarded",
        unitId: targetUnitId,
        residencyType: "owner",
        phoneNumber: "+1999888777",
        vehicleNumber: "XYZ-123",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.resident.email).toBe(onboardEmail);
    expect(body.data.resident.residencyType).toBe("owner");
    expect(body.data.resident.unit.block).toBe("B");
    expect(body.data.resident.unit.flatNumber).toBe("101");

    // Verify unit status is now occupied
    const unitRecords = await db.select().from(units).where(eq(units.id, targetUnitId)).limit(1);
    expect(unitRecords[0].status).toBe("occupied");
  }, 20000);

  test("POST /api/residents/onboard - Failure when unit is occupied", async () => {
    const response = await fetch(`${BASE_URL}/api/residents/onboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${adminCookie}`,
      },
      body: JSON.stringify({
        email: `another_${Date.now()}@example.com`,
        name: "Jane Occupier",
        unitId: targetUnitId,
        residencyType: "tenant",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.message).toContain("Unit is already occupied");
  }, 20000);

  test("GET /api/residents - Failure as standard resident user", async () => {
    const response = await fetch(`${BASE_URL}/api/residents`, {
      method: "GET",
      headers: {
        Cookie: `accessToken=${residentCookie}`,
      },
    });

    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error.message).toBe("Access denied");
  }, 20000);

  test("GET /api/residents - Success as Admin & Filters check", async () => {
    // 1. General search returning the onboarded user
    const response = await fetch(`${BASE_URL}/api/residents?search=Onboarded`, {
      method: "GET",
      headers: {
        Cookie: `accessToken=${adminCookie}`,
      },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.residents.length).toBe(1);
    expect(body.data.residents[0].email).toBe(onboardEmail);
    expect(body.data.residents[0].unit.block).toBe("B");
    expect(body.data.residents[0].residencyType).toBe("owner");

    // 2. Filter by Block B (should match)
    const blockBRes = await fetch(`${BASE_URL}/api/residents?block=B`, {
      method: "GET",
      headers: { Cookie: `accessToken=${adminCookie}` },
    });
    const blockBBody = await blockBRes.json();
    expect(blockBBody.data.residents.length).toBe(1);

    // 3. Filter by Block A (should not match)
    const blockARes = await fetch(`${BASE_URL}/api/residents?block=A`, {
      method: "GET",
      headers: { Cookie: `accessToken=${adminCookie}` },
    });
    const blockABody = await blockARes.json();
    expect(blockABody.data.residents.length).toBe(0);
  }, 20000);
});
