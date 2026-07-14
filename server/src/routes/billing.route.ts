import { Router } from "express";
import { BillingController } from "../controllers/billing.controller";
import { generateBatchBillsSchema } from "../validations/billing.validation";
import { validateBody } from "../middlewares/validate";
import { authenticate, requireRoles } from "../middlewares/auth";

const router = Router();

router.post(
  "/generate-batch",
  authenticate,
  requireRoles(["admin"]),
  validateBody(generateBatchBillsSchema),
  BillingController.generateBatchBills
);

router.get(
  "/unit/:unitId",
  authenticate,
  BillingController.getUnitBills
);

router.get(
  "/bills/:id",
  authenticate,
  BillingController.getBillById
);

export default router;
