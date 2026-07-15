import { Router } from "express";
import multer from "multer";
import { ComplaintController } from "../controllers/complaint.controller";
import { lodgeComplaintSchema, assignComplaintSchema, resolveComplaintSchema } from "../validations/complaint.validation";
import { validateBody } from "../middlewares/validate";
import { authenticate, requireRoles } from "../middlewares/auth";

const router = Router();

// Multer in-memory storage config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post(
  "/",
  authenticate,
  requireRoles(["resident"]),
  upload.single("image"),
  validateBody(lodgeComplaintSchema),
  ComplaintController.lodgeComplaint
);

router.patch(
  "/:id/assign",
  authenticate,
  requireRoles(["admin"]),
  validateBody(assignComplaintSchema),
  ComplaintController.assignComplaint
);

router.patch(
  "/:id/resolve",
  authenticate,
  requireRoles(["admin", "committee"]),
  validateBody(resolveComplaintSchema),
  ComplaintController.resolveComplaint
);

router.get(
  "/",
  authenticate,
  ComplaintController.getComplaints
);

router.get(
  "/:id",
  authenticate,
  ComplaintController.getComplaintById
);

export default router;
