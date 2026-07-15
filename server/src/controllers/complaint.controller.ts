import { Request, Response, NextFunction } from "express";
import { ComplaintService } from "../services/complaint.service";
import { AppError } from "../middlewares/errorHandler";

export class ComplaintController {
  // POST /api/complaints
  public static async lodgeComplaint(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { title, description, category, priority } = req.body;
      const file = req.file;

      const complaint = await ComplaintService.lodgeComplaint(
        {
          title,
          description,
          category,
          priority,
        },
        file?.buffer,
        file?.originalname,
        req.user.id
      );

      res.status(201).json({
        success: true,
        data: { complaint },
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/complaints/:id/assign
  public static async assignComplaint(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { assignedToId } = req.body;

      const complaint = await ComplaintService.assignComplaint(id, assignedToId);

      res.status(200).json({
        success: true,
        data: { complaint },
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/complaints/:id/resolve
  public static async resolveComplaint(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { id } = req.params;
      const { status, resolutionDetails } = req.body;

      const complaint = await ComplaintService.resolveComplaint(
        id,
        status,
        resolutionDetails,
        req.user.id,
        req.user.role
      );

      res.status(200).json({
        success: true,
        data: { complaint },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/complaints
  public static async getComplaints(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const status = req.query.status as any;
      const category = req.query.category as string | undefined;
      const priority = req.query.priority as any;
      const page = parseInt(req.query.page as string || "1", 10);
      const limit = parseInt(req.query.limit as string || "10", 10);

      const result = await ComplaintService.getComplaints(
        {
          status,
          category,
          priority,
          page,
          limit,
        },
        req.user.id,
        req.user.role
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/complaints/:id
  public static async getComplaintById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { id } = req.params;
      const complaint = await ComplaintService.getComplaintById(
        id,
        req.user.id,
        req.user.role
      );

      res.status(200).json({
        success: true,
        data: { complaint },
      });
    } catch (error) {
      next(error);
    }
  }
}
