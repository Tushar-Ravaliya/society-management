import { Request, Response, NextFunction } from "express";
import { AnnouncementService } from "../services/announcement.service";
import { AppError } from "../middlewares/errorHandler";

export class AnnouncementController {
  // POST /api/announcements
  public static async createAnnouncement(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { title, content, audience, isPinned, expiresAt } = req.body;
      const announcement = await AnnouncementService.createAnnouncement(
        {
          title,
          content,
          audience,
          isPinned,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
        req.user.id
      );

      res.status(201).json({
        success: true,
        data: { announcement },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/announcements
  public static async getAnnouncements(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const page = parseInt(req.query.page as string || "1", 10);
      const limit = parseInt(req.query.limit as string || "10", 10);

      const result = await AnnouncementService.getAnnouncements(
        req.user.role,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/announcements/:id
  public static async deleteAnnouncement(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { id } = req.params;
      await AnnouncementService.deleteAnnouncement(id, req.user.id, req.user.role);

      res.status(200).json({
        success: true,
        data: {
          message: "Announcement deleted successfully",
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
