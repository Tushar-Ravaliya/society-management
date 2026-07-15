import { Router } from "express";
import { ResidentController } from "../controllers/resident.controller";
import { createUnitSchema, onboardResidentSchema, updateResidentSchema, updateUnitSchema } from "../validations/resident.validation";
import { validateBody } from "../middlewares/validate";
import { authenticate, requireRoles } from "../middlewares/auth";

export const unitRouter = Router();

unitRouter.post(
  "/",
  authenticate,
  requireRoles(["admin"]),
  validateBody(createUnitSchema),
  ResidentController.createUnit
);

unitRouter.get(
  "/",
  authenticate,
  requireRoles(["admin"]),
  ResidentController.getUnits
);

unitRouter.patch(
  "/:id",
  authenticate,
  requireRoles(["admin"]),
  validateBody(updateUnitSchema),
  ResidentController.updateUnit
);

unitRouter.delete(
  "/:id",
  authenticate,
  requireRoles(["admin"]),
  ResidentController.deleteUnit
);

export const residentRouter = Router();

residentRouter.post(
  "/onboard",
  authenticate,
  requireRoles(["admin"]),
  validateBody(onboardResidentSchema),
  ResidentController.onboardResident
);

residentRouter.get(
  "/",
  authenticate,
  requireRoles(["admin", "committee"]),
  ResidentController.getResidentDirectory
);

residentRouter.patch(
  "/:id",
  authenticate,
  requireRoles(["admin"]),
  validateBody(updateResidentSchema),
  ResidentController.updateResident
);

residentRouter.delete(
  "/:id",
  authenticate,
  requireRoles(["admin"]),
  ResidentController.deleteResident
);
