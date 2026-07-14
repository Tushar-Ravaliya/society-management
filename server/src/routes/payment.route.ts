import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { recordOfflinePaymentSchema, verifyPaymentSchema, createOnlineOrderSchema, verifyOnlinePaymentSchema } from "../validations/payment.validation";
import { validateBody } from "../middlewares/validate";
import { authenticate, requireRoles } from "../middlewares/auth";

const router = Router();

router.post(
  "/offline",
  authenticate,
  requireRoles(["resident"]),
  validateBody(recordOfflinePaymentSchema),
  PaymentController.recordOfflinePayment
);

router.post(
  "/online/order",
  authenticate,
  requireRoles(["resident"]),
  validateBody(createOnlineOrderSchema),
  PaymentController.createOnlineOrder
);

router.post(
  "/online/verify",
  authenticate,
  requireRoles(["resident"]),
  validateBody(verifyOnlinePaymentSchema),
  PaymentController.verifyOnlinePayment
);

router.patch(
  "/:id/verify",
  authenticate,
  requireRoles(["admin", "committee"]),
  validateBody(verifyPaymentSchema),
  PaymentController.verifyPayment
);

router.get(
  "/",
  authenticate,
  PaymentController.getPayments
);

export default router;
