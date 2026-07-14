import { Router } from "express";
import { ResidentController } from "../controllers/resident.controller";
import { createUnitSchema, onboardResidentSchema } from "../validations/resident.validation";
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
