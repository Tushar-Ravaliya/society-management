import { Router } from "express";
import { ServiceRequestController } from "../controllers/service-request.controller";
import { raiseServiceRequestSchema, processServiceRequestSchema } from "../validations/service-request.validation";
import { validateBody } from "../middlewares/validate";
import { authenticate, requireRoles } from "../middlewares/auth";

const router = Router();

router.post(
  "/",
  authenticate,
  requireRoles(["resident"]),
  validateBody(raiseServiceRequestSchema),
  ServiceRequestController.raiseServiceRequest
);

router.patch(
  "/:id",
  authenticate,
  requireRoles(["admin", "committee"]),
  validateBody(processServiceRequestSchema),
  ServiceRequestController.processServiceRequest
);

router.get(
  "/",
  authenticate,
  ServiceRequestController.getServiceRequests
);

router.get(
  "/:id",
  authenticate,
  ServiceRequestController.getServiceRequestById
);

export default router;
