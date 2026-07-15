import bcrypt from "bcrypt";
import crypto from "crypto";
import { eq, and, like, or, sql } from "drizzle-orm";
import { db } from "../db/db";
import { users, units, residentProfiles } from "../db/schema";
import { AppError } from "../middlewares/errorHandler";

export interface UnitDTO {
  id: string;
  block: string;
  flatNumber: string;
  floor: number;
  bhkType: string;
  status: "occupied" | "vacant";
}

export interface ResidentDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phoneNumber?: string | null;
  unit?: {
    id: string;
    block: string;
    flatNumber: string;
  };
  residencyType?: string;
  vehicleNumber?: string | null;
}

export class ResidentService {
  // Create a new housing unit
  public static async createUnit(data: {
    block: string;
    flatNumber: string;
    floor: number;
    bhkType: string;
  }): Promise<UnitDTO> {
    // Check if flat already exists
    const existing = await db
      .select()
      .from(units)
      .where(
        and(
          eq(units.block, data.block),
          eq(units.flatNumber, data.flatNumber)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new AppError("Flat already exists in this block", 409);
    }

    const [newUnit] = await db
      .insert(units)
      .values({
        block: data.block,
        flatNumber: data.flatNumber,
        floor: data.floor,
        bhkType: data.bhkType,
        status: "vacant",
      })
      .returning();

    return {
      id: newUnit.id,
      block: newUnit.block,
      flatNumber: newUnit.flatNumber,
      floor: newUnit.floor,
      bhkType: newUnit.bhkType,
      status: newUnit.status,
    };
  }

  // Onboard and assign a resident to a unit
  public static async onboardResident(data: {
    email: string;
    name: string;
    unitId: string;
    residencyType: "owner" | "tenant";
    phoneNumber?: string;
    vehicleNumber?: string;
  }): Promise<ResidentDTO> {
    // 1. Verify Unit exists and is vacant
    const unitRecords = await db
      .select()
      .from(units)
      .where(eq(units.id, data.unitId))
      .limit(1);

    if (unitRecords.length === 0) {
      throw new AppError("Unit not found", 404);
    }

    const unit = unitRecords[0];
    if (unit.status !== "vacant") {
      throw new AppError("Unit is already occupied", 400);
    }

    // 2. Check if email already registered
    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (userRecords.length > 0) {
      throw new AppError("Email is already registered", 409);
    }

    // Generate random temporary password
    const tempPassword = crypto.randomBytes(16).toString("hex");
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // 3. Atomically onboard user, assign unit, update unit status
    return await db.transaction(async (tx) => {
      // Create user record
      const [newUser] = await tx
        .insert(users)
        .values({
          email: data.email,
          name: data.name,
          phoneNumber: data.phoneNumber || null,
          passwordHash,
          role: "resident",
          status: "pending", // Pending activation
        })
        .returning();

      // Create profile record
      const [newProfile] = await tx
        .insert(residentProfiles)
        .values({
          id: newUser.id,
          unitId: data.unitId,
          residencyType: data.residencyType,
          vehicleNumber: data.vehicleNumber || null,
        })
        .returning();

      // Update unit status to occupied
      await tx
        .update(units)
        .set({ status: "occupied" })
        .where(eq(units.id, data.unitId));

      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        status: newUser.status,
        phoneNumber: newUser.phoneNumber,
        residencyType: newProfile.residencyType,
        vehicleNumber: newProfile.vehicleNumber,
        unit: {
          id: unit.id,
          block: unit.block,
          flatNumber: unit.flatNumber,
        },
      };
    });
  }

  // Get Resident Directory with pagination, searching, and filtering
  public static async getResidentDirectory(filters: {
    block?: string;
    residencyType?: "owner" | "tenant";
    search?: string;
    page: number;
    limit: number;
  }) {
    const page = Math.max(1, filters.page);
    const limit = Math.max(1, filters.limit);
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters.block) {
      conditions.push(eq(units.block, filters.block));
    }
    if (filters.residencyType) {
      conditions.push(eq(residentProfiles.residencyType, filters.residencyType));
    }
    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          like(users.name, searchPattern),
          like(users.email, searchPattern)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get paginated list of residents
    const residentsQuery = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        residencyType: residentProfiles.residencyType,
        vehicleNumber: residentProfiles.vehicleNumber,
        unit: {
          id: units.id,
          block: units.block,
          flatNumber: units.flatNumber,
        },
      })
      .from(residentProfiles)
      .innerJoin(users, eq(residentProfiles.id, users.id))
      .innerJoin(units, eq(residentProfiles.unitId, units.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(residentProfiles)
      .innerJoin(users, eq(residentProfiles.id, users.id))
      .innerJoin(units, eq(residentProfiles.unitId, units.id))
      .where(whereClause);

    const [residentsResult, totalResult] = await Promise.all([
      residentsQuery,
      totalCountQuery,
    ]);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return {
      residents: residentsResult,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  // Get Units with pagination and filtering
  public static async getUnits(filters: {
    status?: string;
    block?: string;
    page: number;
    limit: number;
  }) {
    const page = Math.max(1, filters.page);
    const limit = Math.max(1, filters.limit);
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters.status) {
      conditions.push(eq(units.status, filters.status as any));
    }
    if (filters.block) {
      conditions.push(eq(units.block, filters.block));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const unitsQuery = db
      .select()
      .from(units)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(units)
      .where(whereClause);

    const [unitsResult, totalResult] = await Promise.all([
      unitsQuery,
      totalCountQuery,
    ]);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return {
      units: unitsResult,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
