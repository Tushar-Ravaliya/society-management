import { Router } from "express";
import { AnnouncementController } from "../controllers/announcement.controller";
import { createAnnouncementSchema, updateAnnouncementSchema } from "../validations/announcement.validation";
import { validateBody } from "../middlewares/validate";
import { authenticate, requireRoles } from "../middlewares/auth";

const router = Router();

router.post(
  "/",
  authenticate,
  requireRoles(["admin", "committee"]),
  validateBody(createAnnouncementSchema),
  AnnouncementController.createAnnouncement
);

router.get(
  "/",
  authenticate,
  AnnouncementController.getAnnouncements
);

router.patch(
  "/:id",
  authenticate,
  requireRoles(["admin", "committee"]),
  validateBody(updateAnnouncementSchema),
  AnnouncementController.updateAnnouncement
);

router.delete(
  "/:id",
  authenticate,
  requireRoles(["admin", "committee"]),
  AnnouncementController.deleteAnnouncement
);

export default router;
