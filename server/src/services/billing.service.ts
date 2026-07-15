import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "../db/db";
import { units, maintenanceBills } from "../db/schema";
import { AuditService } from "./audit.service";
import { AppError } from "../middlewares/errorHandler";

export class BillingService {
  // Generate batch bills for all occupied units
  public static async generateBatchBills(
    data: {
      billingPeriod: string;
      dueDate: Date;
      defaultMaintenance: number;
      defaultWater: number;
      defaultElectricity: number;
    },
    adminId?: string
  ): Promise<{ count: number }> {
    // 1. Get all occupied units
    const occupiedUnits = await db
      .select()
      .from(units)
      .where(eq(units.status, "occupied"));

    if (occupiedUnits.length === 0) {
      return { count: 0 };
    }

    let generatedCount = 0;
    const periodSlug = data.billingPeriod.replace(/\s+/g, "").toUpperCase();

    for (const unit of occupiedUnits) {
      const billNumber = `BILL-${periodSlug}-${unit.block.toUpperCase()}${unit.flatNumber}`.trim();

      // Check if bill already exists for this unit and period to ensure idempotency
      const existing = await db
        .select()
        .from(maintenanceBills)
        .where(eq(maintenanceBills.billNumber, billNumber))
        .limit(1);

      if (existing.length > 0) {
        continue; // Skip
      }

      const total = data.defaultMaintenance + data.defaultWater + data.defaultElectricity;

      await db.insert(maintenanceBills).values({
        unitId: unit.id,
        billNumber,
        billingPeriod: data.billingPeriod,
        maintenanceAmount: data.defaultMaintenance.toFixed(2),
        waterAmount: data.defaultWater.toFixed(2),
        electricityAmount: data.defaultElectricity.toFixed(2),
        penaltyAmount: "0.00",
        otherAmount: "0.00",
        totalAmount: total.toFixed(2),
        status: "unpaid",
        dueDate: data.dueDate,
      });

      generatedCount++;
    }

    await AuditService.writeAuditLog({
      actorId: adminId,
      action: "BILL_GENERATED",
      module: "billing",
      description: `Generated ${generatedCount} maintenance bills for period ${data.billingPeriod}.`,
    });

    return { count: generatedCount };
  }

  // Get bills for a specific unit
  public static async getUnitBills(unitId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    
    const query = db
      .select({
        id: maintenanceBills.id,
        billNumber: maintenanceBills.billNumber,
        billingPeriod: maintenanceBills.billingPeriod,
        maintenanceAmount: maintenanceBills.maintenanceAmount,
        waterAmount: maintenanceBills.waterAmount,
        electricityAmount: maintenanceBills.electricityAmount,
        penaltyAmount: maintenanceBills.penaltyAmount,
        otherAmount: maintenanceBills.otherAmount,
        totalAmount: maintenanceBills.totalAmount,
        status: maintenanceBills.status,
        dueDate: maintenanceBills.dueDate,
        unit: {
          block: units.block,
          flatNumber: units.flatNumber,
        },
      })
      .from(maintenanceBills)
      .innerJoin(units, eq(maintenanceBills.unitId, units.id))
      .where(eq(maintenanceBills.unitId, unitId))
      .orderBy(desc(maintenanceBills.createdAt))
      .limit(limit)
      .offset(offset);

    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(maintenanceBills)
      .where(eq(maintenanceBills.unitId, unitId));

    const [results, countResult] = await Promise.all([query, countQuery]);
    
    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return {
      bills: results,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  // Get specific bill by ID
  public static async getBillById(id: string): Promise<any> {
    const records = await db
      .select({
        id: maintenanceBills.id,
        billNumber: maintenanceBills.billNumber,
        billingPeriod: maintenanceBills.billingPeriod,
        maintenanceAmount: maintenanceBills.maintenanceAmount,
        waterAmount: maintenanceBills.waterAmount,
        electricityAmount: maintenanceBills.electricityAmount,
        penaltyAmount: maintenanceBills.penaltyAmount,
        otherAmount: maintenanceBills.otherAmount,
        totalAmount: maintenanceBills.totalAmount,
        status: maintenanceBills.status,
        dueDate: maintenanceBills.dueDate,
        unit: {
          block: units.block,
          flatNumber: units.flatNumber,
        },
      })
      .from(maintenanceBills)
      .innerJoin(units, eq(maintenanceBills.unitId, units.id))
      .where(eq(maintenanceBills.id, id))
      .limit(1);

    if (records.length === 0) {
      throw new AppError("Bill not found", 404);
    }

    return records[0];
  }

  // Get all bills (Admin)
  public static async getAllBills(
    filters: {
      status?: "unpaid" | "paid" | "partially_paid" | "overdue";
      billingPeriod?: string;
      page: number;
      limit: number;
    }
  ) {
    const page = Math.max(1, filters.page);
    const limit = Math.max(1, filters.limit);
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters.status) {
      conditions.push(eq(maintenanceBills.status, filters.status));
    }
    if (filters.billingPeriod) {
      conditions.push(eq(maintenanceBills.billingPeriod, filters.billingPeriod));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const query = db
      .select({
        id: maintenanceBills.id,
        billNumber: maintenanceBills.billNumber,
        billingPeriod: maintenanceBills.billingPeriod,
        maintenanceAmount: maintenanceBills.maintenanceAmount,
        waterAmount: maintenanceBills.waterAmount,
        electricityAmount: maintenanceBills.electricityAmount,
        penaltyAmount: maintenanceBills.penaltyAmount,
        otherAmount: maintenanceBills.otherAmount,
        totalAmount: maintenanceBills.totalAmount,
        status: maintenanceBills.status,
        dueDate: maintenanceBills.dueDate,
        unit: {
          block: units.block,
          flatNumber: units.flatNumber,
        },
      })
      .from(maintenanceBills)
      .innerJoin(units, eq(maintenanceBills.unitId, units.id))
      .where(whereClause)
      .orderBy(desc(maintenanceBills.createdAt))
      .limit(limit)
      .offset(offset);

    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(maintenanceBills)
      .where(whereClause);

    const [results, countResult] = await Promise.all([query, countQuery]);

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return {
      bills: results,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
