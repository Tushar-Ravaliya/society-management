import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";
import { AppError } from "../middlewares/errorHandler";

export class PaymentController {
  // POST /api/payments/offline (Resident only)
  public static async recordOfflinePayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const payment = await PaymentService.recordOfflinePayment(req.body, req.user.id);

      res.status(200).json({
        success: true,
        data: { payment },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/payments/online/order (Resident only)
  public static async createOnlineOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { billId } = req.body;
      const order = await PaymentService.createOnlineOrder(billId, req.user.id);

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/payments/online/verify (Resident only)
  public static async verifyOnlinePayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const result = await PaymentService.verifyOnlinePayment(req.body, req.user.id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/payments/:id/verify (Admin/Committee only)
  public static async verifyPayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { id } = req.params;
      const result = await PaymentService.verifyPayment(id, req.body, req.user.id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/payments (Scoped list)
  public static async getPayments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const status = req.query.status as any;
      const page = parseInt(req.query.page as string || "1", 10);
      const limit = parseInt(req.query.limit as string || "10", 10);

      const result = await PaymentService.getPayments(
        {
          status,
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
