import { eq, and, or, gt, isNull, desc, sql, inArray } from "drizzle-orm";
import { db } from "../db/db";
import { users, announcements } from "../db/schema";
import { AppError } from "../middlewares/errorHandler";

export interface AnnouncementDTO {
  id: string;
  title: string;
  content: string;
  audience: "all" | "residents" | "committee";
  isPinned: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  publishedBy: {
    id: string;
    name: string;
  };
}

export class AnnouncementService {
  // Create an announcement
  public static async createAnnouncement(
    data: {
      title: string;
      content: string;
      audience: "all" | "residents" | "committee";
      isPinned?: boolean;
      expiresAt?: Date | null;
    },
    publishedById: string
  ): Promise<any> {
    const [newAnnouncement] = await db
      .insert(announcements)
      .values({
        title: data.title,
        content: data.content,
        audience: data.audience,
        publishedById,
        isPinned: data.isPinned || false,
        expiresAt: data.expiresAt || null,
      })
      .returning();

    return newAnnouncement;
  }

  // Get announcement feed filtered by role and expiration
  public static async getAnnouncements(
    userRole: "admin" | "committee" | "resident",
    page: number = 1,
    limit: number = 10
  ) {
    const activePage = Math.max(1, page);
    const activeLimit = Math.max(1, limit);
    const offset = (activePage - 1) * activeLimit;

    const conditions = [];

    // Filter out expired announcements
    conditions.push(
      or(
        isNull(announcements.expiresAt),
        gt(announcements.expiresAt, new Date())
      )
    );

    // Audience filtering based on role
    if (userRole === "resident") {
      conditions.push(inArray(announcements.audience, ["all", "residents"]));
    } else {
      // Admin and Committee can see all announcements (all, residents, committee)
      conditions.push(inArray(announcements.audience, ["all", "residents", "committee"]));
    }

    const whereClause = and(...conditions);

    // Fetch announcements with publisher details
    const feedQuery = db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        audience: announcements.audience,
        isPinned: announcements.isPinned,
        expiresAt: announcements.expiresAt,
        createdAt: announcements.createdAt,
        publishedBy: {
          id: users.id,
          name: users.name,
        },
      })
      .from(announcements)
      .innerJoin(users, eq(announcements.publishedById, users.id))
      .where(whereClause)
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt))
      .limit(activeLimit)
      .offset(offset);

    // Get total count
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(announcements)
      .where(whereClause);

    const [feedResult, totalResult] = await Promise.all([
      feedQuery,
      totalCountQuery,
    ]);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / activeLimit);

    return {
      announcements: feedResult,
      pagination: {
        total,
        page: activePage,
        limit: activeLimit,
        totalPages,
      },
    };
  }

  // Delete an announcement
  public static async deleteAnnouncement(
    id: string,
    userId: string,
    userRole: string
  ): Promise<void> {
    const record = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);

    if (record.length === 0) {
      throw new AppError("Announcement not found", 404);
    }

    const announcement = record[0];

    // Deletion access control
    if (userRole === "admin") {
      // Admins can delete any announcement
    } else if (userRole === "committee" && announcement.publishedById === userId) {
      // Committee can delete only their own
    } else {
      throw new AppError("Access denied to delete this announcement", 403);
    }

    await db.delete(announcements).where(eq(announcements.id, id));
  }
}
