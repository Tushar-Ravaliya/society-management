import { Request, Response, NextFunction } from "express";
import { BillingService } from "../services/billing.service";
import { db } from "../db/db";
import { residentProfiles } from "../db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "../middlewares/errorHandler";

export class BillingController {
  // POST /api/billing/generate-batch
  public static async generateBatchBills(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { billingPeriod, dueDate, defaultMaintenance, defaultWater, defaultElectricity } = req.body;
      const result = await BillingService.generateBatchBills(
        {
          billingPeriod,
          dueDate: new Date(dueDate),
          defaultMaintenance,
          defaultWater,
          defaultElectricity,
        },
        req.user.id
      );

      res.status(200).json({
        success: true,
        data: {
          message: `Successfully generated ${result.count} maintenance bills for period ${billingPeriod}.`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/billing/unit/:unitId
  public static async getUnitBills(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { unitId } = req.params;

      // Access control: Residents can only fetch their own unit's bills
      if (req.user.role === "resident") {
        const profileRecords = await db
          .select()
          .from(residentProfiles)
          .where(eq(residentProfiles.id, req.user.id))
          .limit(1);

        if (profileRecords.length === 0 || profileRecords[0].unitId !== unitId) {
          throw new AppError("Access denied to view these bills", 403);
        }
      }

      const page = parseInt(req.query.page as string || "1", 10);
      const limit = parseInt(req.query.limit as string || "10", 10);
      
      const result = await BillingService.getUnitBills(unitId, page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/billing/bills/:id
  public static async getBillById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { id } = req.params;
      const bill = await BillingService.getBillById(id);

      // Access control: Residents can only view their own bill details
      if (req.user.role === "resident") {
        const profileRecords = await db
          .select()
          .from(residentProfiles)
          .where(eq(residentProfiles.id, req.user.id))
          .limit(1);

        // Check if the bill belongs to the resident's unit
        const billRaw = await db.select().from(maintenanceBills).where(eq(maintenanceBills.id, id)).limit(1);
        if (profileRecords.length === 0 || billRaw.length === 0 || profileRecords[0].unitId !== billRaw[0].unitId) {
          throw new AppError("Access denied to view this bill details", 403);
        }
      }

      res.status(200).json({
        success: true,
        data: { bill },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/billing
  public static async getAllBills(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const status = req.query.status as any;
      const billingPeriod = req.query.billingPeriod as string;
      const page = parseInt(req.query.page as string || "1", 10);
      const limit = parseInt(req.query.limit as string || "10", 10);

      const result = await BillingService.getAllBills({
        status,
        billingPeriod,
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
