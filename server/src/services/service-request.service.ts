import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "../db/db";
import { users, residentProfiles, units, serviceRequests } from "../db/schema";
import { AppError } from "../middlewares/errorHandler";

export interface ServiceRequestDTO {
  id: string;
  title: string;
  description: string;
  requestType: "noc" | "clubhouse_booking" | "renovation_permission" | "parking_allocation" | "other";
  status: "pending" | "approved" | "rejected" | "completed";
  preferredDate: Date | null;
  adminRemarks: string | null;
  completedAt: Date | null;
  createdAt: Date;
  raisedBy: {
    name: string;
    flat: string | null;
  };
}

export class ServiceRequestService {
  // Raise a new request (Resident only)
  public static async raiseServiceRequest(
    data: {
      title: string;
      description: string;
      requestType: "noc" | "clubhouse_booking" | "renovation_permission" | "parking_allocation" | "other";
      preferredDate?: Date | null;
    },
    raisedById: string
  ): Promise<any> {
    const [request] = await db
      .insert(serviceRequests)
      .values({
        title: data.title,
        description: data.description,
        requestType: data.requestType,
        preferredDate: data.preferredDate || null,
        raisedById,
        status: "pending",
      })
      .returning();

    return request;
  }

  // Update status & remarks (Admin/Committee only)
  public static async processServiceRequest(
    id: string,
    data: {
      status: "pending" | "approved" | "rejected" | "completed";
      adminRemarks?: string | null;
    }
  ): Promise<any> {
    const records = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id)).limit(1);
    if (records.length === 0) {
      throw new AppError("Service request not found", 404);
    }

    const updates: any = {
      status: data.status,
      adminRemarks: data.adminRemarks || null,
      updatedAt: new Date(),
    };

    if (data.status === "completed") {
      updates.completedAt = new Date();
    } else {
      updates.completedAt = null;
    }

    const [updated] = await db
      .update(serviceRequests)
      .set(updates)
      .where(eq(serviceRequests.id, id))
      .returning();

    return updated;
  }

  // Fetch queue of service requests (scoped)
  public static async getServiceRequests(
    filters: {
      status?: "pending" | "approved" | "rejected" | "completed";
      type?: "noc" | "clubhouse_booking" | "renovation_permission" | "parking_allocation" | "other";
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

    // Role-based visibility
    if (userRole === "resident") {
      conditions.push(eq(serviceRequests.raisedById, userId));
    }

    // Direct filters
    if (filters.status) {
      conditions.push(eq(serviceRequests.status, filters.status));
    }
    if (filters.type) {
      conditions.push(eq(serviceRequests.requestType, filters.type));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Build the select query with joins to get name and flat
    const query = db
      .select({
        id: serviceRequests.id,
        title: serviceRequests.title,
        description: serviceRequests.description,
        requestType: serviceRequests.requestType,
        status: serviceRequests.status,
        preferredDate: serviceRequests.preferredDate,
        adminRemarks: serviceRequests.adminRemarks,
        completedAt: serviceRequests.completedAt,
        createdAt: serviceRequests.createdAt,
        raisedBy: {
          name: users.name,
          flat: sql<string | null>`case when ${units.block} is not null then concat(${units.block}, '-', ${units.flatNumber}) else null end`,
        },
      })
      .from(serviceRequests)
      .innerJoin(users, eq(serviceRequests.raisedById, users.id))
      .leftJoin(residentProfiles, eq(users.id, residentProfiles.id))
      .leftJoin(units, eq(residentProfiles.unitId, units.id))
      .where(whereClause)
      .orderBy(desc(serviceRequests.createdAt))
      .limit(limit)
      .offset(offset);

    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(serviceRequests)
      .where(whereClause);

    const [results, countResult] = await Promise.all([query, countQuery]);

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return {
      serviceRequests: results,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
