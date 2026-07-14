import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { authenticate, requireRoles } from "../middlewares/auth";

const router = Router();

router.get(
  "/admin",
  authenticate,
  requireRoles(["admin"]),
  DashboardController.getAdminDashboard
);

router.get(
  "/resident",
  authenticate,
  requireRoles(["resident"]),
  DashboardController.getResidentDashboard
);

export default router;
