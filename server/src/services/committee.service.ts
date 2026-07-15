import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { users, committeeMembers } from "../db/schema";
import { AppError } from "../middlewares/errorHandler";

export interface CommitteeMemberDTO {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  designation: string;
  portfolio: string;
  termStart: Date;
  termEnd: Date;
  isActive: boolean;
}

export class CommitteeService {
  // Assign a user to the committee
  public static async assignCommitteeMember(data: {
    userId: string;
    designation: string;
    portfolio: string;
    termStart: Date;
    termEnd: Date;
  }): Promise<any> {
    // 1. Verify user exists and is active
    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1);

    if (userRecords.length === 0) {
      throw new AppError("User not found", 404);
    }

    const user = userRecords[0]!;
    if (user.status !== "active") {
      throw new AppError("User is not active", 400);
    }

    // 2. Check if already a committee member
    const existing = await db
      .select()
      .from(committeeMembers)
      .where(eq(committeeMembers.id, data.userId))
      .limit(1);

    if (existing.length > 0) {
      throw new AppError("User is already a committee member", 409);
    }

    // 3. Atomically update user role and insert committee member
    return await db.transaction(async (tx) => {
      // Update user's role to 'committee'
      await tx
        .update(users)
        .set({ role: "committee" })
        .where(eq(users.id, data.userId));

      // Insert committee member record
      const [newMemberRecord] = await tx
        .insert(committeeMembers)
        .values({
          id: data.userId,
          designation: data.designation,
          portfolio: data.portfolio,
          termStart: data.termStart,
          termEnd: data.termEnd,
          isActive: true,
        })
        .returning();

      const newMember = newMemberRecord!;

      return {
        id: newMember.id,
        designation: newMember.designation,
        portfolio: newMember.portfolio,
        termStart: newMember.termStart,
        termEnd: newMember.termEnd,
        isActive: newMember.isActive,
      };
    });
  }

  // Get committee list (authenticated access)
  public static async getCommitteeMembers(activeOnly: boolean = true): Promise<CommitteeMemberDTO[]> {
    const conditions = [];
    if (activeOnly) {
      conditions.push(eq(committeeMembers.isActive, true));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({
        id: committeeMembers.id,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        designation: committeeMembers.designation,
        portfolio: committeeMembers.portfolio,
        termStart: committeeMembers.termStart,
        termEnd: committeeMembers.termEnd,
        isActive: committeeMembers.isActive,
      })
      .from(committeeMembers)
      .innerJoin(users, eq(committeeMembers.id, users.id))
      .where(whereClause);

    return result;
  }

  // Update designation, portfolio, or active status
  public static async updateCommitteeMember(
    id: string,
    data: {
      designation?: string;
      portfolio?: string;
      isActive?: boolean;
    }
  ): Promise<any> {
    // Verify committee member exists
    const existing = await db
      .select()
      .from(committeeMembers)
      .where(eq(committeeMembers.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new AppError("Committee member not found", 404);
    }

    // Update committee record fields directly
    const [updatedRecord] = await db
      .update(committeeMembers)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(committeeMembers.id, id))
      .returning();

    const updated = updatedRecord!;

    return {
      id: updated.id,
      designation: updated.designation,
      portfolio: updated.portfolio,
      termStart: updated.termStart,
      termEnd: updated.termEnd,
      isActive: updated.isActive,
    };
  }

  public static async deleteCommitteeMember(id: string): Promise<void> {
    const existing = await db
      .select()
      .from(committeeMembers)
      .where(eq(committeeMembers.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new AppError("Committee member not found", 404);
    }

    await db.transaction(async (tx) => {
      await tx.delete(committeeMembers).where(eq(committeeMembers.id, id));
      await tx.update(users).set({ role: "resident", updatedAt: new Date() }).where(eq(users.id, id));
    });
  }
}
