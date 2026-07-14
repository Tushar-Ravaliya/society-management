import { Router } from "express";
import { AuditController } from "../controllers/audit.controller";
import { authenticate, requireRoles } from "../middlewares/auth";

const router = Router();

router.get(
  "/",
  authenticate,
  requireRoles(["admin"]),
  AuditController.getAuditLogs
);

export default router;
