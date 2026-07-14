import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../validations/auth.validation";
import { validateBody } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.post("/register", validateBody(registerSchema), AuthController.register);
router.post("/login", validateBody(loginSchema), AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);
router.get("/me", authenticate, AuthController.me);

export default router;
