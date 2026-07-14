import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "../db/db";
import { users, auditLogs } from "../db/schema";
import { AppError } from "../middlewares/errorHandler";

interface LogParams {
  actorId?: string;
  action: string;
  module: string;
  targetId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  // Central utility helper to record logs asynchronously without blocking request/response lifecycle
  public static async writeAuditLog(params: LogParams): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        actorId: params.actorId || null,
        action: params.action,
        module: params.module,
        targetId: params.targetId || null,
        description: params.description,
        metadata: params.metadata || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      });
    } catch (error) {
      console.error("Failed to write audit log:", error);
    }
  }

  // Fetch chronological system log queue (Admin only)
  public static async getAuditLogs(
    filters: {
      module?: string;
      actorId?: string;
      action?: string;
      page: number;
      limit: number;
    }
  ) {
    const page = Math.max(1, filters.page);
    const limit = Math.max(1, filters.limit);
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters.module) {
      conditions.push(eq(auditLogs.module, filters.module));
    }
    if (filters.actorId) {
      conditions.push(eq(auditLogs.actorId, filters.actorId));
    }
    if (filters.action) {
      conditions.push(eq(auditLogs.action, filters.action));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const query = db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        module: auditLogs.module,
        targetId: auditLogs.targetId,
        description: auditLogs.description,
        ipAddress: auditLogs.ipAddress,
        createdAt: auditLogs.createdAt,
        actor: {
          name: users.name,
          email: users.email,
        },
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorId, users.id))
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(whereClause);

    const [results, countResult] = await Promise.all([query, countQuery]);

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return {
      logs: results,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
