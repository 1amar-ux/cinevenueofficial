import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from "./auth.validation";

const router = Router();

router.post("/register", validate({ body: registerSchema }), authController.register);
router.post("/login", validate({ body: loginSchema }), authController.login);
router.get("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);
router.post("/google", authController.googleLogin);
router.get("/google", authController.googleLoginRedirect);
router.post("/refresh", validate({ body: refreshTokenSchema }), authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.getMe);
router.post("/forgot-password", validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post("/reset-password", validate({ body: resetPasswordSchema }), authController.resetPassword);

export default router;
