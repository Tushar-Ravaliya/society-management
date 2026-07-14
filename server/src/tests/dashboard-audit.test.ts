import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { Server } from "http";
import app from "../app";
import { db, connection } from "../db/db";
import { users, units, residentProfiles, maintenanceBills, payments, auditLogs } from "../db/schema";
import { eq, like, lt } from "drizzle-orm";
import bcrypt from "bcrypt";

let server: Server;
const PORT = 4574;
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

describe("Dashboard & Audit Log Modules Integration Tests", () => {
  let adminCookie: string | null = null;
  let residentCookie: string | null = null;

  let residentUserId: string;
  let otherResidentUserId: string;
  let unit1Id: string;
  let unit2Id: string;

  const adminEmail = `test_admin_${Date.now()}@example.com`;
  const residentEmail = `test_res_${Date.now()}@example.com`;
  const otherResidentEmail = `test_res2_${Date.now()}@example.com`;
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
    await db.delete(auditLogs);
    await db.delete(payments);
    await db.delete(maintenanceBills);
    await db.delete(residentProfiles);
    await db.delete(units);
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

    // 2. Create Resident 1
    const [res1] = await db.insert(users).values({
      email: residentEmail,
      passwordHash,
      name: "Resident One",
      role: "resident",
      status: "active",
    }).returning();
    residentUserId = res1.id;

    const resLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: residentEmail, password }),
    });
    residentCookie = getCookieValue(resLogin.headers.getSetCookie(), "accessToken");

    // 3. Create Resident 2
    const [res2] = await db.insert(users).values({
      email: otherResidentEmail,
      passwordHash,
      name: "Resident Two",
      role: "resident",
      status: "active",
    }).returning();
    otherResidentUserId = res2.id;

    // 4. Create two Units (occupied) and one vacant
    const [u1] = await db.insert(units).values({ block: "C", flatNumber: "101", floor: 1, bhkType: "2BHK", status: "occupied" }).returning();
    const [u2] = await db.insert(units).values({ block: "C", flatNumber: "102", floor: 1, bhkType: "3BHK", status: "occupied" }).returning();
    await db.insert(units).values({ block: "C", flatNumber: "103", floor: 1, bhkType: "1BHK", status: "vacant" });
    
    unit1Id = u1.id;
    unit2Id = u2.id;

    // Link profiles
    await db.insert(residentProfiles).values({ id: residentUserId, unitId: unit1Id, residencyType: "owner" });
    await db.insert(residentProfiles).values({ id: otherResidentUserId, unitId: unit2Id, residencyType: "tenant" });
  }, 50000);

  afterAll(async () => {
    // Clean up test records
    await db.delete(auditLogs);
    await db.delete(payments);
    await db.delete(maintenanceBills);
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

  test("GET /api/dashboard/admin - Failure as resident", async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/admin`, {
      method: "GET",
      headers: { Cookie: `accessToken=${residentCookie}` },
    });

    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
  }, 20000);

  test("POST /api/billing/generate-batch - Generates bills and records audit logs", async () => {
    // Admin launches batch billing run
    const response = await fetch(`${BASE_URL}/api/billing/generate-batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${adminCookie}`,
      },
      body: JSON.stringify({
        billingPeriod: "June 2026",
        dueDate: "2026-06-30T23:59:59.000Z",
        defaultMaintenance: 100.00,
        defaultWater: 20.00,
        defaultElectricity: 10.00,
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    // Assert that an audit log entry for the bill run was written
    const logs = await db.select().from(auditLogs).where(eq(auditLogs.action, "BILL_GENERATED")).limit(1);
    expect(logs.length).toBe(1);
    expect(logs[0].module).toBe("billing");
    expect(logs[0].description).toContain("Generated 2 maintenance bills");
  }, 20000);

  test("GET /api/dashboard/admin - Success metrics checks", async () => {
    // 1. Mark unit 1's bill as paid to check finances collection rates
    await db
      .update(maintenanceBills)
      .set({ status: "paid" })
      .where(eq(maintenanceBills.unitId, unit1Id));

    const response = await fetch(`${BASE_URL}/api/dashboard/admin`, {
      method: "GET",
      headers: { Cookie: `accessToken=${adminCookie}` },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    // Occupancy validations (total: 3, occupied: 2, vacant: 1)
    expect(body.data.occupancy.totalUnits).toBe(3);
    expect(body.data.occupancy.occupied).toBe(2);
    expect(body.data.occupancy.vacant).toBe(1);

    // Finances validations (totalBilled: 130 + 130 = 260.00; totalCollected: 130.00)
    expect(body.data.finances.billingPeriod).toBe("June 2026");
    expect(body.data.finances.totalBilled).toBe("260.00");
    expect(body.data.finances.totalCollected).toBe("130.00");
    expect(body.data.finances.collectionRatePercent).toBe(50.0);
  }, 20000);

  test("GET /api/dashboard/resident - Success checks", async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/resident`, {
      method: "GET",
      headers: { Cookie: `accessToken=${residentCookie}` },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    
    // Resident One paid their bill, so outstanding count should be 0
    expect(body.data.outstandingBillsCount).toBe(0);
    expect(body.data.totalDueAmount).toBe("0.00");
  }, 20000);

  test("GET /api/reports/defaulters - Lists resident two as past due", async () => {
    // Modify unit 2's bill dueDate to yesterday to simulate overdue status
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await db
      .update(maintenanceBills)
      .set({ dueDate: yesterday, status: "overdue" })
      .where(eq(maintenanceBills.unitId, unit2Id));

    const response = await fetch(`${BASE_URL}/api/reports/defaulters`, {
      method: "GET",
      headers: { Cookie: `accessToken=${adminCookie}` },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.defaulters.length).toBe(1);
    expect(body.data.defaulters[0].flat).toBe("C-102");
    expect(body.data.defaulters[0].residentName).toBe("Resident Two");
    expect(body.data.defaulters[0].overdueAmount).toBe("130.00");
    expect(body.data.defaulters[0].missedPeriods).toContain("June 2026");
  }, 20000);

  test("GET /api/admin/audit-logs - Scopes and filters check", async () => {
    const response = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
      method: "GET",
      headers: { Cookie: `accessToken=${adminCookie}` },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.logs.length).toBeGreaterThanOrEqual(1);
    expect(body.data.logs[0].action).toBe("BILL_GENERATED");
    expect(body.data.logs[0].actor.name).toBe("Test Admin User");
  }, 20000);
});
