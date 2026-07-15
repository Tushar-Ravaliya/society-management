import type { Request, Response, NextFunction } from "express";
import { CommitteeService } from "../services/committee.service";

export class CommitteeController {
  // POST /api/committee
  public static async assignCommitteeMember(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId, designation, portfolio, termStart, termEnd } = req.body;
      const committeeMember = await CommitteeService.assignCommitteeMember({
        userId,
        designation,
        portfolio,
        termStart: new Date(termStart),
        termEnd: new Date(termEnd),
      });

      res.status(201).json({
        success: true,
        data: { committeeMember },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/committee
  public static async getCommitteeMembers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const activeOnly = req.query.activeOnly !== "false"; // Defaults to true unless explicitly 'false'
      const committee = await CommitteeService.getCommitteeMembers(activeOnly);

      res.status(200).json({
        success: true,
        data: { committee },
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/committee/:id
  public static async updateCommitteeMember(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const { designation, portfolio, isActive } = req.body;

      const committeeMember = await CommitteeService.updateCommitteeMember(id, {
        designation,
        portfolio,
        isActive,
      });

      res.status(200).json({
        success: true,
        data: { committeeMember },
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/committee/:id
  public static async deleteCommitteeMember(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      await CommitteeService.deleteCommitteeMember(id);

      res.status(200).json({
        success: true,
        data: { message: "Committee member deleted successfully" },
      });
    } catch (error) {
      next(error);
    }
  }
}
