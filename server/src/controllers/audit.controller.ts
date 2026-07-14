import { Request, Response, NextFunction } from "express";
import { AuditService } from "../services/audit.service";
import { AppError } from "../middlewares/errorHandler";

export class AuditController {
  // GET /api/admin/audit-logs (Admin only)
  public static async getAuditLogs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const module = req.query.module as string | undefined;
      const actorId = req.query.actorId as string | undefined;
      const action = req.query.action as string | undefined;
      const page = parseInt(req.query.page as string || "1", 10);
      const limit = parseInt(req.query.limit as string || "20", 10);

      const result = await AuditService.getAuditLogs({
        module,
        actorId,
        action,
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
