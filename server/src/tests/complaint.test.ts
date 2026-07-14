import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { Server } from "http";
import app from "../app";
import { db, connection } from "../db/db";
import { users, complaints } from "../db/schema";
import { eq, like } from "drizzle-orm";
import bcrypt from "bcrypt";

let server: Server;
const PORT = 4571;
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

describe("Complaint Management Module Integration Tests", () => {
  let adminCookie: string | null = null;
  let committeeCookie: string | null = null;
  let residentCookie: string | null = null;
  
  let adminUserId: string;
  let committeeUserId: string;
  let residentUserId: string;

  let testComplaintId: string;

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
    await db.delete(complaints);
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
  }, 50000);

  afterAll(async () => {
    // Clean up test records
    await db.delete(complaints);
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

  test("POST /api/complaints - Success as resident with image file", async () => {
    const formData = new FormData();
    formData.append("title", "Water leaking in parking");
    formData.append("description", "A pipe is leaking in slot B-12 causing mud accumulation.");
    formData.append("category", "Plumbing");
    formData.append("priority", "high");
    
    // Attach dummy file
    formData.append(
      "image",
      new Blob([Buffer.from("dummy image content")], { type: "image/jpeg" }),
      "parking_leak.jpg"
    );

    const response = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: {
        Cookie: `accessToken=${residentCookie}`,
      },
      body: formData,
    });

    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.complaint.title).toBe("Water leaking in parking");
    expect(body.data.complaint.status).toBe("pending");
    expect(body.data.complaint.imageUrl).toContain("mock"); // Verify mocked Imagekit upload url
    expect(body.data.complaint.imageFileId).toBe("mock_file_id_123");

    testComplaintId = body.data.complaint.id;
  }, 20000);

  test("POST /api/complaints - Failure for invalid priority enum", async () => {
    const formData = new FormData();
    formData.append("title", "Broken gate lock");
    formData.append("description", "Gate 2 lock is loose.");
    formData.append("category", "Security");
    formData.append("priority", "super-urgent"); // invalid value

    const response = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: {
        Cookie: `accessToken=${residentCookie}`,
      },
      body: formData,
    });

    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
  }, 20000);

  test("PATCH /api/complaints/:id/assign - Failure as resident", async () => {
    const response = await fetch(`${BASE_URL}/api/complaints/${testComplaintId}/assign`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${residentCookie}`,
      },
      body: JSON.stringify({
        assignedToId: committeeUserId,
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
  }, 20000);

  test("PATCH /api/complaints/:id/assign - Success as Admin", async () => {
    const response = await fetch(`${BASE_URL}/api/complaints/${testComplaintId}/assign`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${adminCookie}`,
      },
      body: JSON.stringify({
        assignedToId: committeeUserId,
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.complaint.status).toBe("assigned");
    expect(body.data.complaint.assignedToId).toBe(committeeUserId);
  }, 20000);

  test("PATCH /api/complaints/:id/resolve - Failure as unauthorized committee member", async () => {
    // Create an unauthorized committee member (not assigned to complaint)
    const unauthorizedCommEmail = `test_unauth_comm_${Date.now()}@example.com`;
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      email: unauthorizedCommEmail,
      passwordHash,
      name: "Unauthorized Committee Member",
      role: "committee",
      status: "active",
    });

    const unauthLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: unauthorizedCommEmail, password }),
    });
    const unauthorizedCookie = getCookieValue(unauthLogin.headers.getSetCookie(), "accessToken");

    const response = await fetch(`${BASE_URL}/api/complaints/${testComplaintId}/resolve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${unauthorizedCookie}`,
      },
      body: JSON.stringify({
        status: "resolved",
        resolutionDetails: "Fixed the broken lock.",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
  }, 20000);

  test("PATCH /api/complaints/:id/resolve - Success as assigned committee member", async () => {
    const response = await fetch(`${BASE_URL}/api/complaints/${testComplaintId}/resolve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${committeeCookie}`,
      },
      body: JSON.stringify({
        status: "resolved",
        resolutionDetails: "Replaced the leaking pipes and sealed the B-12 parking area.",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.complaint.status).toBe("resolved");
    expect(body.data.complaint.resolutionDetails).toContain("Replaced the leaking pipes");
  }, 20000);

  test("GET /api/complaints - Scoped feeds for Resident and Admin", async () => {
    // Create another complaint raised by a different resident to check visibility filter
    const otherResidentEmail = `test_res2_${Date.now()}@example.com`;
    const passwordHash = await bcrypt.hash(password, 10);
    const [otherResUser] = await db.insert(users).values({
      email: otherResidentEmail,
      passwordHash,
      name: "Other Resident",
      role: "resident",
      status: "active",
    }).returning();

    await db.insert(complaints).values({
      title: "Elevator not working",
      description: "Elevator in wing C is stuck on ground floor.",
      category: "Maintenance",
      priority: "medium",
      raisedById: otherResUser.id,
      status: "pending",
    });

    // 1. Fetch complaints as Resident 1 (should only see the 1 complaint they raised)
    const resResponse = await fetch(`${BASE_URL}/api/complaints`, {
      method: "GET",
      headers: { Cookie: `accessToken=${residentCookie}` },
    });
    const resBody = await resResponse.json();
    expect(resResponse.status).toBe(200);
    expect(resBody.data.complaints.length).toBe(1);
    expect(resBody.data.complaints[0].title).toBe("Water leaking in parking");

    // 2. Fetch complaints as Admin (should see both complaints)
    const adminResponse = await fetch(`${BASE_URL}/api/complaints`, {
      method: "GET",
      headers: { Cookie: `accessToken=${adminCookie}` },
    });
    const adminBody = await adminResponse.json();
    expect(adminResponse.status).toBe(200);
    expect(adminBody.data.complaints.length).toBe(2);
  }, 20000);
});
