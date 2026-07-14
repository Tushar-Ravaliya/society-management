import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { Server } from "http";
import app from "../app";
import { db, connection } from "../db/db";
import { users, units, residentProfiles, maintenanceBills, payments } from "../db/schema";
import { eq, like } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { config } from "../config/config";

let server: Server;
const PORT = 4573;
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

describe("Billing & Payment Modules Integration Tests", () => {
  let adminCookie: string | null = null;
  let residentCookie: string | null = null;

  let residentUserId: string;
  let testUnitId: string;
  let firstBillId: string;
  let secondBillId: string;
  let offlinePaymentId: string;

  const adminEmail = `test_admin_${Date.now()}@example.com`;
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

    // 2. Create Resident
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

    // 3. Create Unit and associate Resident (occupied)
    const [unit] = await db.insert(units).values({
      block: "B",
      flatNumber: "104",
      floor: 1,
      bhkType: "2BHK",
      status: "occupied",
    }).returning();
    testUnitId = unit.id;

    await db.insert(residentProfiles).values({
      id: residentUserId,
      unitId: testUnitId,
      residencyType: "owner",
    });
  }, 50000);

  afterAll(async () => {
    // Clean up test records
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

  test("POST /api/billing/generate-batch - Failure as resident", async () => {
    const response = await fetch(`${BASE_URL}/api/billing/generate-batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${residentCookie}`,
      },
      body: JSON.stringify({
        billingPeriod: "July 2026",
        dueDate: "2026-07-31T23:59:59.000Z",
        defaultMaintenance: 120.00,
        defaultWater: 15.00,
        defaultElectricity: 10.00,
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
  }, 20000);

  test("POST /api/billing/generate-batch - Success as Admin", async () => {
    const response = await fetch(`${BASE_URL}/api/billing/generate-batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${adminCookie}`,
      },
      body: JSON.stringify({
        billingPeriod: "July 2026",
        dueDate: "2026-07-31T23:59:59.000Z",
        defaultMaintenance: 120.00,
        defaultWater: 15.00,
        defaultElectricity: 10.00,
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.message).toContain("Successfully generated 1 maintenance bills");
  }, 20000);

  test("GET /api/billing/unit/:unitId - Scopes and total computation checks", async () => {
    // 1. Fetch as Resident for their own unit (success)
    const response = await fetch(`${BASE_URL}/api/billing/unit/${testUnitId}`, {
      method: "GET",
      headers: { Cookie: `accessToken=${residentCookie}` },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.bills.length).toBe(1);
    expect(body.data.bills[0].billNumber).toBe("BILL-JULY2026-B104");
    expect(body.data.bills[0].totalAmount).toBe("145.00"); // 120 + 15 + 10
    expect(body.data.bills[0].status).toBe("unpaid");

    firstBillId = body.data.bills[0].id;
  }, 20000);

  test("POST /api/payments/offline - Success as resident", async () => {
    const response = await fetch(`${BASE_URL}/api/payments/offline`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${residentCookie}`,
      },
      body: JSON.stringify({
        billId: firstBillId,
        paymentMethod: "bank_transfer",
        amount: 145.00,
        transactionReference: "UTR-TEST-12345678",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.payment.status).toBe("pending");
    expect(body.data.payment.amount).toBe("145.00");
    expect(body.data.payment.transactionReference).toBe("UTR-TEST-12345678");

    offlinePaymentId = body.data.payment.id;
  }, 20000);

  test("PATCH /api/payments/:id/verify - Success as Admin (marks bill paid)", async () => {
    const response = await fetch(`${BASE_URL}/api/payments/${offlinePaymentId}/verify`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${adminCookie}`,
      },
      body: JSON.stringify({
        status: "verified",
        verificationNotes: "Verified with bank statement.",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.payment.status).toBe("verified");
    expect(body.data.billStatus).toBe("paid");

    // Double check associated bill status in DB
    const billRecords = await db.select().from(maintenanceBills).where(eq(maintenanceBills.id, firstBillId)).limit(1);
    expect(billRecords[0].status).toBe("paid");
  }, 20000);

  test("POST /api/payments/online/order & verify signature checkout flows", async () => {
    // 1. Generate second bill for August 2026
    const batchRes = await fetch(`${BASE_URL}/api/billing/generate-batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${adminCookie}`,
      },
      body: JSON.stringify({
        billingPeriod: "August 2026",
        dueDate: "2026-08-31T23:59:59.000Z",
        defaultMaintenance: 120.00,
        defaultWater: 15.00,
        defaultElectricity: 10.00,
      }),
    });
    expect(batchRes.status).toBe(200);

    // Get the second bill ID
    const billResponse = await fetch(`${BASE_URL}/api/billing/unit/${testUnitId}`, {
      method: "GET",
      headers: { Cookie: `accessToken=${residentCookie}` },
    });
    const billBody = await billResponse.json();
    const secondBill = billBody.data.bills.find((b: any) => b.billingPeriod === "August 2026");
    secondBillId = secondBill.id;

    // 2. Create online order
    const orderRes = await fetch(`${BASE_URL}/api/payments/online/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${residentCookie}`,
      },
      body: JSON.stringify({ billId: secondBillId }),
    });

    const orderBody = await orderRes.json();
    expect(orderRes.status).toBe(200);
    expect(orderBody.success).toBe(true);
    expect(orderBody.data.orderId).toContain("order_mock");

    const orderId = orderBody.data.orderId;
    const paymentId = `pay_mock_${Date.now()}`;

    // 3. Generate correct signature locally
    const signText = orderId + "|" + paymentId;
    const signature = crypto
      .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
      .update(signText)
      .digest("hex");

    // 4. Verify checkout
    const verifyResponse = await fetch(`${BASE_URL}/api/payments/online/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${residentCookie}`,
      },
      body: JSON.stringify({
        billId: secondBillId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      }),
    });

    const verifyBody = await verifyResponse.json();
    expect(verifyResponse.status).toBe(200);
    expect(verifyBody.success).toBe(true);
    expect(verifyBody.data.billStatus).toBe("paid");
    expect(verifyBody.data.payment.status).toBe("verified");
  }, 20000);
});
