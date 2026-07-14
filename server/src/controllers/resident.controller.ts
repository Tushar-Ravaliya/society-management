import { Request, Response, NextFunction } from "express";
import { ResidentService } from "../services/resident.service";

export class ResidentController {
  // POST /api/units
  public static async createUnit(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { block, flatNumber, floor, bhkType } = req.body;
      const unit = await ResidentService.createUnit({
        block,
        flatNumber,
        floor,
        bhkType,
      });

      res.status(201).json({
        success: true,
        data: { unit },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/residents/onboard
  public static async onboardResident(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, name, unitId, residencyType, phoneNumber, vehicleNumber } = req.body;
      const resident = await ResidentService.onboardResident({
        email,
        name,
        unitId,
        residencyType,
        phoneNumber,
        vehicleNumber,
      });

      res.status(201).json({
        success: true,
        data: {
          message: "Resident onboarded successfully. Temporary registration link sent to email.",
          resident,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/residents
  public static async getResidentDirectory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const block = req.query.block as string | undefined;
      const residencyType = req.query.residencyType as "owner" | "tenant" | undefined;
      const search = req.query.search as string | undefined;
      const page = parseInt(req.query.page as string || "1", 10);
      const limit = parseInt(req.query.limit as string || "10", 10);

      const result = await ResidentService.getResidentDirectory({
        block,
        residencyType,
        search,
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
