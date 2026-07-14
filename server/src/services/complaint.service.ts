import ImageKit from "imagekit";
import { eq, and, or, sql, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../db/db";
import { users, complaints } from "../db/schema";
import { config } from "../config/config";
import { AppError } from "../middlewares/errorHandler";

let imagekit: ImageKit | null = null;

if (process.env.NODE_ENV !== "test") {
  if (config.IMAGEKIT_PUBLIC_KEY && config.IMAGEKIT_PRIVATE_KEY && config.IMAGEKIT_URL_ENDPOINT) {
    imagekit = new ImageKit({
      publicKey: config.IMAGEKIT_PUBLIC_KEY,
      privateKey: config.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: config.IMAGEKIT_URL_ENDPOINT,
    });
  }
}

export class ComplaintService {
  // Lodge a complaint (Resident only)
  public static async lodgeComplaint(
    data: {
      title: string;
      description: string;
      category: string;
      priority: "low" | "medium" | "high";
    },
    fileBuffer: Buffer | undefined,
    fileName: string | undefined,
    raisedById: string
  ): Promise<any> {
    let imageUrl: string | null = null;
    let imageFileId: string | null = null;

    if (fileBuffer && fileName) {
      if (process.env.NODE_ENV === "test") {
        imageUrl = "https://ik.imagekit.io/mock/complaints/test_image.jpg";
        imageFileId = "mock_file_id_123";
      } else {
        if (!imagekit) {
          throw new AppError("Imagekit configuration is missing on the server", 500);
        }
        try {
          const uploadRes = await imagekit.upload({
            file: fileBuffer,
            fileName: `complaint_${Date.now()}_${fileName}`,
            folder: "/complaints",
          });
          imageUrl = uploadRes.url;
          imageFileId = uploadRes.fileId;
        } catch (error: any) {
          throw new AppError(`Failed to upload image to Cloud: ${error.message}`, 500);
        }
      }
    }

    const [complaint] = await db
      .insert(complaints)
      .values({
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        imageUrl,
        imageFileId,
        raisedById,
        status: "pending",
      })
      .returning();

    return complaint;
  }

  // Assign complaint (Admin only)
  public static async assignComplaint(id: string, assignedToId: string): Promise<any> {
    // 1. Verify complaint exists
    const records = await db.select().from(complaints).where(eq(complaints.id, id)).limit(1);
    if (records.length === 0) {
      throw new AppError("Complaint not found", 404);
    }

    // 2. Verify assignee user exists and has role 'committee' or 'admin'
    const userRecords = await db.select().from(users).where(eq(users.id, assignedToId)).limit(1);
    if (userRecords.length === 0) {
      throw new AppError("Assignee user not found", 404);
    }

    const assignee = userRecords[0];
    if (assignee.status !== "active") {
      throw new AppError("Assignee user is not active", 400);
    }
    if (assignee.role !== "committee" && assignee.role !== "admin") {
      throw new AppError("Complaints can only be assigned to Admin or Committee members", 400);
    }

    const [updated] = await db
      .update(complaints)
      .set({
        assignedToId,
        status: "assigned",
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, id))
      .returning();

    return updated;
  }

  // Resolve or reject a complaint (Assigned Committee Member or Admin)
  public static async resolveComplaint(
    id: string,
    status: "resolved" | "rejected",
    resolutionDetails: string,
    userId: string,
    userRole: string
  ): Promise<any> {
    // Verify complaint exists
    const records = await db.select().from(complaints).where(eq(complaints.id, id)).limit(1);
    if (records.length === 0) {
      throw new AppError("Complaint not found", 404);
    }

    const complaint = records[0];

    // Access control: Admin or the assigned Committee Member
    if (userRole === "admin") {
      // Admin is allowed
    } else if (userRole === "committee" && complaint.assignedToId === userId) {
      // Assigned Committee Member is allowed
    } else {
      throw new AppError("You are not authorized to resolve this complaint", 403);
    }

    const [updated] = await db
      .update(complaints)
      .set({
        status,
        resolutionDetails,
        resolvedAt: status === "resolved" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, id))
      .returning();

    return updated;
  }

  // Get list of complaints (scoped by role)
  public static async getComplaints(
    filters: {
      status?: "pending" | "assigned" | "resolved" | "rejected";
      category?: string;
      priority?: "low" | "medium" | "high";
      page: number;
      limit: number;
    },
    userId: string,
    userRole: string
  ) {
    const page = Math.max(1, filters.page);
    const limit = Math.max(1, filters.limit);
    const offset = (page - 1) * limit;

    const conditions = [];

    // 1. Role-based scoping
    if (userRole === "resident") {
      // Residents only see their own complaints
      conditions.push(eq(complaints.raisedById, userId));
    }

    // 2. Additional filter conditions
    if (filters.status) {
      conditions.push(eq(complaints.status, filters.status));
    }
    if (filters.category) {
      conditions.push(eq(complaints.category, filters.category));
    }
    if (filters.priority) {
      conditions.push(eq(complaints.priority, filters.priority));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Aliased tables for joins
    const raiser = alias(users, "raiser");
    const assignee = alias(users, "assignee");

    const query = db
      .select({
        id: complaints.id,
        title: complaints.title,
        description: complaints.description,
        category: complaints.category,
        status: complaints.status,
        priority: complaints.priority,
        imageUrl: complaints.imageUrl,
        resolutionDetails: complaints.resolutionDetails,
        resolvedAt: complaints.resolvedAt,
        createdAt: complaints.createdAt,
        raisedBy: {
          id: raiser.id,
          name: raiser.name,
          email: raiser.email,
        },
        assignedTo: {
          id: assignee.id,
          name: assignee.name,
          email: assignee.email,
        },
      })
      .from(complaints)
      .innerJoin(raiser, eq(complaints.raisedById, raiser.id))
      .leftJoin(assignee, eq(complaints.assignedToId, assignee.id))
      .where(whereClause)
      .orderBy(desc(complaints.createdAt))
      .limit(limit)
      .offset(offset);

    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(complaints)
      .where(whereClause);

    const [results, countResult] = await Promise.all([query, countQuery]);

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return {
      complaints: results,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
