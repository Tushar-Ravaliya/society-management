import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service";
import { AppError } from "../middlewares/errorHandler";

export class DashboardController {
  // GET /api/dashboard/admin (Admin only)
  public static async getAdminDashboard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await DashboardService.getAdminDashboard();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/dashboard/resident (Resident only)
  public static async getResidentDashboard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const data = await DashboardService.getResidentDashboard(req.user.id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/reports/defaulters (Admin/Committee only)
  public static async getDefaultersReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await DashboardService.getDefaultersReport();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
