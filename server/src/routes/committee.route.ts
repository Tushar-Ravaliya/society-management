import { Router } from "express";
import { CommitteeController } from "../controllers/committee.controller";
import { assignCommitteeMemberSchema, updateCommitteeMemberSchema } from "../validations/committee.validation";
import { validateBody } from "../middlewares/validate";
import { authenticate, requireRoles } from "../middlewares/auth";

const router = Router();

router.post(
  "/",
  authenticate,
  requireRoles(["admin"]),
  validateBody(assignCommitteeMemberSchema),
  CommitteeController.assignCommitteeMember
);

router.get(
  "/",
  authenticate,
  CommitteeController.getCommitteeMembers
);

router.patch(
  "/:id",
  authenticate,
  requireRoles(["admin"]),
  validateBody(updateCommitteeMemberSchema),
  CommitteeController.updateCommitteeMember
);

router.delete(
  "/:id",
  authenticate,
  requireRoles(["admin"]),
  CommitteeController.deleteCommitteeMember
);

export default router;
