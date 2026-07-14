import { Request, Response, NextFunction } from "express";
import { ServiceRequestService } from "../services/service-request.service";
import { AppError } from "../middlewares/errorHandler";

export class ServiceRequestController {
  // POST /api/service-requests
  public static async raiseServiceRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { title, description, requestType, preferredDate } = req.body;
      const serviceRequest = await ServiceRequestService.raiseServiceRequest(
        {
          title,
          description,
          requestType,
          preferredDate: preferredDate ? new Date(preferredDate) : null,
        },
        req.user.id
      );

      res.status(201).json({
        success: true,
        data: { serviceRequest },
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/service-requests/:id
  public static async processServiceRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status, adminRemarks } = req.body;

      const serviceRequest = await ServiceRequestService.processServiceRequest(id, {
        status,
        adminRemarks,
      });

      res.status(200).json({
        success: true,
        data: { serviceRequest },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/service-requests
  public static async getServiceRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const status = req.query.status as any;
      const type = req.query.type as any;
      const page = parseInt(req.query.page as string || "1", 10);
      const limit = parseInt(req.query.limit as string || "10", 10);

      const result = await ServiceRequestService.getServiceRequests(
        {
          status,
          type,
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
}
