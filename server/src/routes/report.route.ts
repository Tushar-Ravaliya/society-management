import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { authenticate, requireRoles } from "../middlewares/auth";

const router = Router();

router.get(
  "/defaulters",
  authenticate,
  requireRoles(["admin", "committee"]),
  DashboardController.getDefaultersReport
);

export default router;
